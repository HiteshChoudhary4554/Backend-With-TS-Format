import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { ApiError } from '../../commom/utils/api-Error.js';
import { db } from '../../db/index.js';
import { usersTable } from '../../db/schema.js';
import { ApiResponse } from '../../commom/utils/api-Response.js';

async function getZoomAccessToken() {
  const credentials = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );
    if (!response.ok) throw ApiError.conflict(`Failed to get Zoom access token..`);

    const data = (await response.json()) as { access_token?: string };
    return data.access_token;
  } catch (error) {
    throw ApiError.conflict(error instanceof Error ? error.message : String(error));
  }
}

async function createZoomMeeting(): Promise<{ join_url: string; start_url: string }> {
  const accessToken = await getZoomAccessToken();
  const userId = 'me';
  try {
    const response = await fetch(`https://api.zoom.us/v2/users/${userId}/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'English Speaking 1-on-1 Lesson',
        type: 3,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
        },
      }),
    });

    if (!response.ok) throw ApiError.conflict(`Failed to create Zoom meeting..`);

    const data = (await response.json()) as { join_url: string; start_url: string };
    return { join_url: data.join_url, start_url: data.start_url };
  } catch (error) {
    throw ApiError.conflict(error instanceof Error ? error.message : String(error));
  }
}

const getAllStudents = async (req: Request, res: Response) => {
  // get all students from the database whose role is 'student'
  const allStudents = await db.select().from(usersTable).where(eq(usersTable.role, 'student'));

  if (!allStudents)
    return ApiResponse.internalServerError(
      res,
      'something went wrong while fetch students',
      "student doesn't find..",
    );

  const allFilteredStudents = allStudents.map((student) => {
    return {
      id: student.id,
      name: student.fullName,
      email: student.email,
      phone: student.phone,
      avatar: student.avatarUrl,
      publicId: student.publicId,
      startTime: student.startTime,
      zoomStartUrl: student.zoomStartUrl,
      role: student.role,
      emailVerified: student.emailVerified,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  });
  return ApiResponse.ok(res, 'student fetch successfully', { allStudents: allFilteredStudents });
};
export { createZoomMeeting, getAllStudents };
