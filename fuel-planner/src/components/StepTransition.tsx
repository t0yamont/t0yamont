import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  direction: 'forward' | 'back';
  stepKey: string | number;
}

const variants = {
  enter: (dir: 'forward' | 'back') => ({
    x: dir === 'forward' ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: 'forward' | 'back') => ({
    x: dir === 'forward' ? '-100%' : '100%',
    opacity: 0,
  }),
};

export default function StepTransition({ children, direction, stepKey }: Props) {
  return (
    <motion.div
      key={stepKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.28 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
