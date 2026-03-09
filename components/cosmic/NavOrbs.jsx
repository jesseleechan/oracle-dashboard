import { useState, useEffect } from 'react';
import { Home, Settings, Pen, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NavOrbs({ synthesisReady }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Link href="/">
        <motion.div className="nav-orb nav-orb-tl" title="Home" whileHover={{ scale: 1.15 }}>
          <Home size={16} strokeWidth={1.5} />
        </motion.div>
      </Link>
      
      <Link href="/archive">
        <motion.div className="nav-orb nav-orb-tr" title="Archive" whileHover={{ scale: 1.15 }}>
          <Archive size={16} strokeWidth={1.5} />
        </motion.div>
      </Link>
      
      <Link href="/settings">
        <motion.div className={`nav-orb nav-orb-bl ${synthesisReady ? 'pulse-ready' : ''}`} title="Settings / Synthesis" whileHover={{ scale: 1.15 }}>
          <Settings size={16} strokeWidth={1.5} />
        </motion.div>
      </Link>
      
      <Link href="/revision">
        <motion.div className="nav-orb nav-orb-br" title="Revision Chamber" whileHover={{ scale: 1.15 }}>
          <Pen size={16} strokeWidth={1.5} />
        </motion.div>
      </Link>
    </>
  );
}
