import bcrypt from "bcrypt";

export const hash = async (pw: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(pw, saltRounds);

  return hashedPassword;
};

export const compare = async (pw: string, hash: string) => {
  const passwordMatch = await bcrypt.compare(pw, hash);
  return passwordMatch;
};
