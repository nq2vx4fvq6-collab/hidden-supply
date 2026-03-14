import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Login — Urban Supply",
};

export default function LoginPage() {
  redirect("/admin/login");
}
