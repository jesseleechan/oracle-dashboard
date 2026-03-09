import Link from 'next/link';
import { prisma } from '@/lib/db';
import ArchiveInteractive from '@/components/archive/ArchiveInteractive';

export const metadata = { title: "Mundane State | Log Archive" };

export default async function ArchivePage() {
  const logs = await prisma.log.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <ArchiveInteractive initialLogs={logs} />;
}
