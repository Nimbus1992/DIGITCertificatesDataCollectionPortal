export function generateArn(prefix: string): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const md = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const hm = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${y}${md}-${hm}-${seq}`;
}

export function generateLicenseNo(prefix: string): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}/${year}/${rand}`;
}