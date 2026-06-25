import { useRouter } from "next/router";
import { startTransition, useEffect, useState } from "react";
import ThinkingMachine from "@/components/thinkingMachine/ThinkingMachine";
import { fetchProject, joinProject } from "@/lib/thinkingMachine/apiClient";
import { readCurrentUser } from "@/lib/thinkingMachine/clientUser";

const LOGIN_STORAGE_KEY = "isLoggedIn";

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    const run = async () => {
      try {
        const nextCurrentUser = readCurrentUser();
        let matchedProject = await fetchProject(id);

        if (!matchedProject) {
          void router.replace("/");
          return;
        }

        // Automatically join the project if not a member
        const isMember = Array.isArray(matchedProject.members) && matchedProject.members.some(m => m.id === nextCurrentUser.id);
        if (!isMember) {
          const updatedMembers = await joinProject(matchedProject.id, {
            ...nextCurrentUser,
            role: nextCurrentUser.role || "editor"
          });
          matchedProject = {
            ...matchedProject,
            members: updatedMembers
          };
        }

        startTransition(() => {
          setProject(matchedProject);
          setCurrentUser(nextCurrentUser);
          setIsLoading(false);
        });
      } catch {
        void router.replace("/");
      }
    };
    void run();
  }, [id, router, router.isReady]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EFEFEF] text-slate-900">
        <div className="rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading workspace...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#EFEFEF]">
      <ThinkingMachine
        projectId={String(project?.id || id || "")}
        initialProjectTitle={project?.title || "Untitled Project"}
        projectMetaHref="/"
        projectMetaLabel="Back to home"
        currentUser={currentUser}
      />
    </main>
  );
}
