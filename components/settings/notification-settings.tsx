"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, selectClass } from "@/components/form";
import { Switch } from "@/components/settings/switch";
import { account, notificationTopics, reminderLeadDays, type NotificationTopic } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function NotificationSettings() {
  const [topics, setTopics] = useState<NotificationTopic[]>(notificationTopics);
  const [lead, setLead] = useState(7);
  const [saved, setSaved] = useState({ topics: notificationTopics, lead: 7 });
  const [justSaved, setJustSaved] = useState(false);
  const dirty = lead !== saved.lead || JSON.stringify(topics) !== JSON.stringify(saved.topics);

  const toggle = (id: string, channel: "email" | "text", value: boolean) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, [channel]: value } : t)));
    setJustSaved(false);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>How we keep you posted</CardTitle>
        <CardDescription>
          Emails go to {account.email}. Texts go to {account.phone}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <div className="hidden grid-cols-[1fr_4rem_4rem] gap-4 px-6 text-xs font-medium text-muted-foreground sm:grid">
          <span>Topic</span>
          <span className="text-center">Email</span>
          <span className="text-center">Text</span>
        </div>
        <ul className="divide-y border-y">
          {topics.map((t) => (
            <li key={t.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_4rem_4rem] sm:items-center sm:gap-4">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <div className="flex items-center gap-2 sm:justify-center">
                <Switch
                  id={`notify-${t.id}-email`}
                  label={`${t.label} by email`}
                  checked={t.email}
                  disabled={t.emailLocked}
                  onChange={(v) => toggle(t.id, "email", v)}
                />
                {t.emailLocked && <Lock className="size-3.5 text-muted-foreground" aria-label="Always on" />}
                <span className="text-xs text-muted-foreground sm:hidden">Email</span>
              </div>
              <div className="flex items-center gap-2 sm:justify-center">
                <Switch id={`notify-${t.id}-text`} label={`${t.label} by text`} checked={t.text} onChange={(v) => toggle(t.id, "text", v)} />
                <span className="text-xs text-muted-foreground sm:hidden">Text</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="max-w-sm px-6">
          <Field id="reminder-lead" label="When should we remind you about a deadline?">
            <select
              id="reminder-lead"
              value={lead}
              onChange={(e) => {
                setLead(Number(e.target.value));
                setJustSaved(false);
              }}
              className={cn(selectClass, "w-full")}
            >
              {reminderLeadDays.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? "day" : "days"} before
                </option>
              ))}
            </select>
          </Field>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3">
        <p role="status" className={cn("flex items-center gap-2 text-sm text-green-700", !justSaved && "invisible")}>
          <CheckCircle2 className="size-4" aria-hidden />
          Saved.
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            disabled={!dirty}
            onClick={() => {
              setTopics(saved.topics);
              setLead(saved.lead);
            }}
          >
            Discard
          </Button>
          <Button
            disabled={!dirty}
            onClick={() => {
              setSaved({ topics, lead });
              setJustSaved(true);
            }}
          >
            Save changes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
