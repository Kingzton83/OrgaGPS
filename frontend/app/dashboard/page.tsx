"use client";

import "/app/dashboard/layout.css";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataFetcher } from "../components/get_data";
import Schedules from "../components/schedules";
import Tasks from "../components/tasks";
import Users from "../components/Users";
import { User } from "../components/interfaces";

export default function Dashboard() {
  const router = useRouter();
  const dataFetcher = useMemo(() => new DataFetcher(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserOnce() {
      try {
        if (!dataFetcher.token) {
          const refreshed = await dataFetcher.refreshTokens();
          if (!refreshed) {
            router.push("/");
            return;
          }
        }
        const res = await fetch(`${dataFetcher.rootPath}/api/accounts/user/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else if (res.status === 401) {
          const refreshed = await dataFetcher.refreshTokens();
          if (!refreshed) {
            router.push("/");
            return;
          }
          const retryRes = await fetch(`${dataFetcher.rootPath}/api/accounts/user/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          });
          if (retryRes.ok) {
            const userData = await retryRes.json();
            setUser(userData);
          } else {
            router.push("/");
          }
        } else {
          throw new Error(`Failed to fetch user data, status: ${res.status}`);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchUserOnce();
  }, [dataFetcher, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="dashboard-main">
      <section>
        <Schedules dataFetcher={dataFetcher} />
        <Tasks dataFetcher={dataFetcher} />
        <Users dataFetcher={dataFetcher} />
      </section>
    </main>
  );
}
