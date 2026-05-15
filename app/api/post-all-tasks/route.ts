import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/db';
import dayjs from 'dayjs';

const DATE_FORMAT = 'DD-MM-YY';

export async function POST() {
  const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL;

  console.log('1. API Hit. URL is:', GOOGLE_SHEET_URL);

  if (!GOOGLE_SHEET_URL) {
    return NextResponse.json({ error: 'Env missing' }, { status: 500 });
  }

  try {
    console.log('2. Fetching from Prisma...');
    const tasks = await prisma.task.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        client: true,
        createdBy: true,
        taskAssignments: { include: { user: true } },
      },
    });
    console.log(`3. Found ${tasks.length} tasks.`);

    const formattedData = tasks.map((task) => ({
      title: task.title,
      description: task.description || '',
      paper_type: task.paper_type || '',
      note: task.note || '',
      amount: task.amount,
      status: task.status,
      client: task.client?.name || 'N/A',
      created_at: dayjs(task.createdAt).format(DATE_FORMAT),
      delivery_date: task.duration
        ? dayjs(task.duration).format(DATE_FORMAT)
        : '',
      startDate: task.startDate
        ? dayjs(task.startDate).format(DATE_FORMAT)
        : '',
      unique_id: task.unique_id || '',
      assign: task.taskAssignments.map((a) => a.user.name).join(', '),
      created_by: task.createdBy?.name || 'System',
    }));

    console.log('4. Sending to Google Sheets...');
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: formattedData }),
    });

    const result = await response.text();
    console.log('5. Google Response:', result);

    return NextResponse.json({ message: 'Success' });
  } catch (error: unknown) {
    console.error('Export Error:', (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
