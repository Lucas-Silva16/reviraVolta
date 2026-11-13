import { cookies } from 'next/headers';
import { validAdminSession } from '@/lib/auth';
import { adminCookie } from '@/lib/http';
import { AdminDashboard, AdminLogin } from '@/components/admin-dashboard';
export const metadata = { title: 'Painel do docente' };
export default async function Admin() {
  const authenticated = validAdminSession((await cookies()).get(adminCookie())?.value);
  return authenticated ? <AdminDashboard/> : <AdminLogin/>;
}
