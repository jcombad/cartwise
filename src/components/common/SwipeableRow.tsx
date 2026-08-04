import type {
  ReactNode,
} from "react";

import {
  Check,
  Trash2,
} from "lucide-react";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";

type SwipeableRowProps = {
  children: ReactNode;

  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
};

const MAX_DRAG_DISTANCE = 52;
const ACTION_THRESHOLD = 36;

export function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
}: SwipeableRowProps) {
  const x = useMotionValue(0);

  const completeOpacity =
    useTransform(
      x,
      [0, 14, ACTION_THRESHOLD],
      [0, 0.45, 1]
    );

  const completeScale =
    useTransform(
      x,
      [0, 22, ACTION_THRESHOLD],
      [0.75, 0.9, 1.12]
    );

  const removeOpacity =
    useTransform(
      x,
      [
        -ACTION_THRESHOLD,
        -14,
        0,
      ],
      [1, 0.45, 0]
    );

  const removeScale =
    useTransform(
      x,
      [
        -ACTION_THRESHOLD,
        -22,
        0,
      ],
      [1.12, 0.9, 0.75]
    );

  function returnToCenter() {
    animate(x, 0, {
      type: "spring",
      stiffness: 520,
      damping: 42,
    });
  }

  function handleDragEnd() {
    const offset = x.get();

    if (
      offset >= ACTION_THRESHOLD &&
      onSwipeRight
    ) {
      onSwipeRight();
      return;
    }

    if (
      offset <= -ACTION_THRESHOLD &&
      onSwipeLeft
    ) {
      onSwipeLeft();
      return;
    }

    returnToCenter();
  }

  return (
    <div className="relative overflow-hidden bg-card">
      <motion.div
        style={{
          opacity: completeOpacity,
          scale: completeScale,
        }}
        className="
          pointer-events-none
          absolute
          left-[1.35rem]
          top-1/2
          z-0
          flex
          h-7
          w-7
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-emerald-500
          text-white
        "
        aria-hidden="true"
      >
        <Check
          className="h-4 w-4"
          strokeWidth={3}
        />
      </motion.div>

      <motion.div
        style={{
          opacity: removeOpacity,
          scale: removeScale,
        }}
        className="
          pointer-events-none
          absolute
          right-[1.35rem]
          top-1/2
          z-0
          flex
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-destructive/12
          text-destructive
        "
        aria-hidden="true"
      >
        <Trash2
          className="h-5 w-5"
          strokeWidth={2.25}
        />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{
          left: -MAX_DRAG_DISTANCE,
          right: MAX_DRAG_DISTANCE,
        }}
        dragElastic={0.08}
        dragMomentum={false}
        style={{
          x,
        }}
        onDragEnd={
          handleDragEnd
        }
        whileDrag={{
          scale: 0.998,
        }}
        className="
          relative
          z-10
          touch-pan-y
          bg-card
        "
      >
        {children}
      </motion.div>
    </div>
  );
}