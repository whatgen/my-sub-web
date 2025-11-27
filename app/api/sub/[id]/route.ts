import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// GET /api/sub/:id - 获取订阅内容
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 读取文件
    const filePath = join(process.cwd(), 'subscriptions', `${id}.txt`);
    const content = await readFile(filePath, 'utf-8');

    // 返回纯文本内容
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    return new NextResponse('订阅不存在', { status: 404 });
  }
}
