import { redirect } from "next/navigation";

// fake data...
const user = {
  role: "user",
};

export default function DashboardPage() {
  if (user.role === "user") return redirect("/dashboard/user");
  if (user.role === "vendor") return redirect("/dashboard/vendor");
  if (user.role === "admin") return redirect("/dashboard/admin");
}
