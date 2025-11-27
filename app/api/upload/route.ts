import { NextRequest, NextResponse } from 'next/server';
import { decode } from 'js-base64';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

// POST /api/upload - 上传订阅内容到文件
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const oldId = formData.get('oldId') as string | null; // 旧文件的 ID，用于删除

    if (!content) {
      return NextResponse.json({
        Code: 0,
        Message: '内容不能为空'
      });
    }

    // 解码 base64 内容
    const decodedContent = decode(content);

    // 生成新的唯一 ID
    const newId = Math.random().toString(36).substring(2, 15);

    // 确保 subscriptions 文件夹存在
    const subsDir = join(process.cwd(), 'subscriptions');
    await mkdir(subsDir, { recursive: true });

    // 保存到新文件
    const newFilePath = join(subsDir, `${newId}.txt`);
    await writeFile(newFilePath, decodedContent, 'utf-8');

    // 如果提供了旧文件 ID，删除旧文件
    if (oldId && oldId !== newId) {
      try {
        const oldFilePath = join(subsDir, `${oldId}.txt`);
        await unlink(oldFilePath);
        console.log(`Deleted old subscription file: ${oldId}.txt`);
      } catch (error) {
        // 忽略删除错误（文件可能已经不存在）
        console.warn(`Failed to delete old file ${oldId}.txt:`, error);
      }
    }

    // 返回 URL
    const url = `${request.nextUrl.origin}/api/sub/${newId}`;

    return NextResponse.json({
      Code: 1,
      Url: url,
      Message: oldId ? '更新成功' : '上传成功'
    });
  } catch (error) {
    return NextResponse.json({
      Code: 0,
      Message: error instanceof Error ? error.message : '操作失败'
    });
  }
}
