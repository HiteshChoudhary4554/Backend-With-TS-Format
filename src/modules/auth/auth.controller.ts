import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { usersTable } from '../../db/schema.js';
import { ApiResponse } from '../../commom/utils/api-Response.js';
import { sendVerificationEmail } from '../../commom/utils/email.service.js';
import {
  createHash,
  createRefreshToken,
  createSixCode,
  createToken,
  verifyRefreshToken,
} from '../../commom/utils/token.js';
import type { Request, Response } from 'express';
import { createAccessToken } from '../../commom/utils/token.js';
import { uploadOnCloudinary } from '../../commom/utils/cloudinary.js';
import { ApiError } from '../../commom/utils/api-Error.js';
import { createZoomMeeting } from '../class/class.controller.js';

interface RegisterRequestBody {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl: string;
  startTime: string;
}

const register = async (req: Request, res: Response) => {
  const { fullName, email, phone, password, startTime }: RegisterRequestBody = req.body;
  const [userEmailResult] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (userEmailResult)
    return ApiResponse.badRequest(
      res,
      'Duplicate entry..',
      `user with email ${email} already exists`,
    );

  const salt: string = createToken();
  const hashedPassword: string = createHash(salt, password);
  const rawVerificationCode: string = createSixCode();
  const hashedVerificationCode: string = createHash(salt, rawVerificationCode);

  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    return ApiResponse.badRequest(res, 'Avatar upload failed..', 'Unable to upload avatar');
  }

  const cloudinaryRes = await uploadOnCloudinary(avatarLocalPath, 'avatar');

  if (!cloudinaryRes) {
    return ApiResponse.internalServerError(
      res,
      'Avatar upload failed..',
      'Unable to upload avatar to cloud storage',
    );
  }

  const zoomMeeting = await createZoomMeeting();

  const [user] = await db
    .insert(usersTable)
    .values({
      fullName,
      email,
      phone,
      salt,
      password: hashedPassword,
      avatarUrl: cloudinaryRes.url,
      publicId: cloudinaryRes.public_id,
      startTime,
      zoomJoinUrl: zoomMeeting.join_url,
      zoomStartUrl: zoomMeeting.start_url,
      verificationToken: hashedVerificationCode,
    })
    .returning({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
    });

  if (!user)
    return ApiResponse.internalServerError(
      res,
      'User registration failed..',
      'Unable to create user',
    );

  // raw verification token is sent to the user for email verification
  try {
    await sendVerificationEmail(user.email, rawVerificationCode);
  } catch {
    throw ApiError.forbidden('something went wrong while send verification code..');
  }

  return ApiResponse.created(res, 'User registered successfully..', user);
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user)
    return ApiResponse.badRequest(
      res,
      'Invalid credentials..',
      `user with email ${email} does not exist`,
    );

  const hashedPassword: string = createHash(user.salt, password);
  if (hashedPassword !== user.password)
    return ApiResponse.badRequest(res, 'Invalid credentials..', 'Incorrect password');

  if (!user.emailVerified)
    return ApiResponse.unauthorizedUser(res, 'unauthorized user', 'access unauthorized user...');

  const accessToken = createAccessToken({ id: user.id });
  const refreshToken = createRefreshToken({ id: user.id });

  const hashedRefreshToken: string = createHash(user.salt, refreshToken);
  const [updatedUser] = await db
    .update(usersTable)
    .set({ refreshToken: hashedRefreshToken })
    .where(eq(usersTable.id, user.id))
    .returning({ id: usersTable.id });

  if (!updatedUser)
    return ApiResponse.internalServerError(
      res,
      'User login failed..',
      'Unable to update user with refresh token',
    );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  });

  return ApiResponse.ok(res, 'User logged in successfully..', {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user)
    return ApiResponse.badRequest(
      res,
      'Invalid request..',
      `user with email ${email} does not exist`,
    );
  const hashedVerificationToken: string = createHash(user.salt, verificationCode);
  if (hashedVerificationToken !== user.verificationToken)
    return ApiResponse.badRequest(
      res,
      'Invalid verification token..',
      'Incorrect verification token',
    );
  const [updatedUser] = await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, user.id))
    .returning({ id: usersTable.id });

  return ApiResponse.ok(res, 'Email verified successfully..', updatedUser);
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user)
    return ApiResponse.badRequest(
      res,
      'Invalid request..',
      `user with email ${email} does not exist`,
    );

  const rawVerificationCode: string = createSixCode();
  const hashedVerificationCode: string = createHash(user.salt, rawVerificationCode);

  const [updatedUser] = await db
    .update(usersTable)
    .set({ resetPasswordToken: hashedVerificationCode })
    .where(eq(usersTable.id, user.id))
    .returning({ id: usersTable.id });

  if (!updatedUser)
    return ApiResponse.internalServerError(
      res,
      'Unable to generate reset password token..',
      'Unable to update user with reset password token',
    );

  // raw reset password token is sent to the user for resetting the password
  try {
    sendVerificationEmail(user.email, rawVerificationCode);
  } catch {
    throw ApiError.forbidden('something went wrong while send verification code..');
  }

  return ApiResponse.ok(res, 'Reset password token generated successfully..', {
    id: user.id,
    email: user.email,
  });
};

const resetPassword = async (req: Request, res: Response) => {
  const { email, resetPasswordCode, newPassword } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user)
    return ApiResponse.badRequest(
      res,
      'Invalid request..',
      `user with email ${email} does not exist`,
    );

  const hashedResetPasswordToken: string = createHash(user.salt, resetPasswordCode);
  if (hashedResetPasswordToken !== user.resetPasswordToken)
    return ApiResponse.badRequest(
      res,
      'Invalid reset password token..',
      'Incorrect reset password token',
    );

  const hashedNewPassword: string = createHash(user.salt, newPassword);
  const [updatedUser] = await db
    .update(usersTable)
    .set({ password: hashedNewPassword, resetPasswordToken: null })
    .where(eq(usersTable.id, user.id))
    .returning({ id: usersTable.id });

  if (!updatedUser)
    return ApiResponse.internalServerError(
      res,
      'Unable to reset password..',
      'Unable to update user with new password',
    );

  return ApiResponse.ok(res, 'Password reset successfully..', updatedUser);
};

const logout = async (req: Request, res: Response) => {
  // @ts-expect-error req doesn't know about user;
  const { id } = req.user;

  if (!id)
    return ApiResponse.badRequest(res, 'Invalid request..', 'unauthorized user, unable to logout');

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user)
    return ApiResponse.badRequest(res, 'Invalid request..', `user with id ${id} does not exist`);

  const [updatedUser] = await db
    .update(usersTable)
    .set({ refreshToken: null })
    .where(eq(usersTable.id, user.id))
    .returning({ id: usersTable.id });

  if (!updatedUser)
    return ApiResponse.internalServerError(
      res,
      'Unable to logout user..',
      'Unable to update user with null refresh token',
    );

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return ApiResponse.ok(res, 'User logged out successfully..', updatedUser);
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken)
    return ApiResponse.badRequest(res, 'Invalid request..', 'Refresh token not found');

  const isDecoded = verifyRefreshToken(refreshToken);
  if (!isDecoded)
    return ApiResponse.unauthorizedUser(
      res,
      'Invalid refresh token..',
      'Refresh token is invalid or has expired',
    );

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, isDecoded.id));
  if (!user)
    return ApiResponse.badRequest(
      res,
      'Invalid request..',
      `user with id ${isDecoded.id} does not exist`,
    );

  const hashedRefreshToken: string = createHash(user.salt, refreshToken);
  if (hashedRefreshToken !== user.refreshToken)
    return ApiResponse.unauthorizedUser(
      res,
      'Invalid refresh token..',
      'Refresh token is invalid or has expired',
    );

  const newAccessToken = createAccessToken({ id: user.id });
  const newRefreshToken = createRefreshToken({ id: user.id });

  const hashedNewRefreshToken: string = createHash(user.salt, newRefreshToken);
  const [updatedUser] = await db
    .update(usersTable)
    .set({ refreshToken: hashedNewRefreshToken })
    .where(eq(usersTable.id, user.id))
    .returning({ id: usersTable.id });

  if (!updatedUser)
    return ApiResponse.internalServerError(
      res,
      'Unable to refresh access token..',
      'Unable to update user with new refresh token',
    );

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  });

  return ApiResponse.ok(res, 'Access token refreshed successfully..', {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  });
};

const getUserProfile = async (req: Request, res: Response) => {
  // @ts-expect-error req doesn't know about user;
  const { id } = req.user;

  if (!id)
    return ApiResponse.badRequest(
      res,
      'Invalid request..',
      'unauthorized user, unable to get profile',
    );

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user)
    return ApiResponse.badRequest(res, 'Invalid request..', `user with id ${id} does not exist`);

  return ApiResponse.ok(res, 'User profile fetched successfully..', {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    startTime: user.startTime,
    joinUrl: user.zoomJoinUrl,
  });
};

export {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
  getUserProfile,
};
