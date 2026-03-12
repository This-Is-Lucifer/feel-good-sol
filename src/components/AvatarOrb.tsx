import { motion } from "framer-motion";
import avatarImg from "@/assets/avatar.png";

interface AvatarOrbProps {
  isSpeaking?: boolean;
  onClick?: () => void;
}

const AvatarOrb = ({ isSpeaking = false, onClick }: AvatarOrbProps) => {
  return (
    <motion.div
      className="relative cursor-pointer select-none"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Outer glow rings */}
      <div className="absolute inset-0 -m-6 rounded-full bg-primary/5 animate-breathe" />
      <div className="absolute inset-0 -m-3 rounded-full bg-primary/10 animate-breathe [animation-delay:0.5s]" />

      {/* Main orb container */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden animate-glow-pulse">
        {/* Gradient border */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-glow-secondary/20 to-primary/30 p-[2px]">
          <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
            <motion.img
              src={avatarImg}
              alt="MindFi AI Avatar"
              className="w-full h-full object-cover"
              animate={isSpeaking ? {
                scale: [1, 1.02, 1],
                transition: { duration: 0.8, repeat: Infinity }
              } : {}}
            />
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3">
        <span className="relative flex h-3 w-3 md:h-4 md:w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-primary" />
        </span>
      </div>
    </motion.div>
  );
};

export default AvatarOrb;

