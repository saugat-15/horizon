import { useClients } from "@/hooks/useClients";
import { createProject, extractErrorMessage } from "@/lib/api";
import type { ProjectStatus } from "@/lib/types";
import { useMemo, useState, type FormEvent } from "react";
import type { NavigateFunction } from "react-router-dom";
import { createProjectBodySchema } from "@/lib/schemas/create-project";


type FieldErrors = Partial<
    Record<"name" | "clientId" | "description" | "status", string>
>;

function firstFieldMessage(
    errors: Partial<Record<string, string[] | undefined>> | undefined,
    key: keyof FieldErrors,
): string | undefined {
    const list = errors?.[key as string];
    return list?.[0];
}

export function useNewProjectForm(navigate: NavigateFunction) {
    const clients = useClients();
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<ProjectStatus>("IN_PROGRESS");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const clientSelectItems = useMemo(() => {
        if (!clients.data?.length) return undefined;
        return Object.fromEntries(clients.data.map((c) => [c.id, c.name]));
    }, [clients.data]);

    const clearFieldError = (key: keyof FieldErrors) => {
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const parsed = createProjectBodySchema.safeParse({
            name,
            clientId,
            description,
            status,
        });

        if (!parsed.success) {
            const flat = parsed.error.flatten();
            setFieldErrors({
                name: firstFieldMessage(flat.fieldErrors, "name"),
                clientId: firstFieldMessage(flat.fieldErrors, "clientId"),
                description: firstFieldMessage(flat.fieldErrors, "description"),
                status: firstFieldMessage(flat.fieldErrors, "status"),
            });
            return;
        }

        setFieldErrors({});
        setSubmitting(true);
        void createProject({
            name: parsed.data.name,
            clientId: parsed.data.clientId,
            description: parsed.data.description,
            status: parsed.data.status,
        })
            .then((created) => {
                navigate(`/projects/${created.id}`);
            })
            .catch((err: unknown) => {
                setError(extractErrorMessage(err));
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    return {
        clients,
        name,
        setName,
        clientId,
        setClientId,
        description,
        setDescription,
        status,
        setStatus,
        submitting,
        error,
        fieldErrors,
        clientSelectItems,
        clearFieldError,
        handleSubmit,
    };
}