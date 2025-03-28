import { SpringConfigInput } from "./config";

export const slowSpring: SpringConfigInput = {
  stiffness: 170,
  damping: 50,
  mass: 3,
};

export const mellowSpring: SpringConfigInput = {
  stiffness: 470,
  damping: 70,
  mass: 3,
};

export const rapidSpring: SpringConfigInput = {
  stiffness: 530,
  damping: 40,
  mass: 1,
};

export const quickSpring: SpringConfigInput = {
  stiffness: 340,
  damping: 60,
  mass: 3,
};

export const almostInstantSpring: SpringConfigInput = {
  stiffness: 1000,
  damping: 40,
  mass: 1,
};

export const instantSpring: SpringConfigInput = {
  stiffness: 1,
  damping: 1,
  mass: 0,
};

export const nonOvershootingSpring: SpringConfigInput = {
  stiffness: 300,
  damping: 30,
  mass: 0.3,
};

export const hideSpring: SpringConfigInput = {
  stiffness: 600,
  damping: 50,
  mass: 1,
};
