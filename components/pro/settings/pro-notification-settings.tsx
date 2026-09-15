"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, selectClass } from "@/components/form";
import { Switch } from "@/components/settings/switch";
import { practitioner, proNotificationTopics, proReminderLeadDays, type NotificationTopic } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const QUIET_HOURS = ["Never — reach me any time", "9pm to 7am", "8pm to 8am", "Weekends and evenings"];

export function ProNotificationSettings() {
  const [topics, setTopics] = useState<NotificationTopic[]>(proNotificationTopics);
  const [lead, setLead] = useState(7);
  const [quiet, setQuiet] = useState(QUIET_HOURS[1]);
  const [saved, setSaved] = useState({ topics: proNotificationTopics, lead: 7, quiet: QUIET_HOURS[1] });
  const [justSaved, setJustSaved] = useState(false);
  const dirty = lead !== saved.lead || quiet !== saved.quiet || JSON.stringify(topics) !== JSON.stringify(saved.topics);

  const toggle = (id: string, channel: "email" | "text", value: boolean) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, [channel]: value } : t)));
    setJustSaved(false);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>What reaches you</CardTitle>
        <CardDescription>
          Emails go to {practitioner.email}. Texts go to {practitioner.phone}.
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
                  id={`pro-notify-${t.id}-email`}
                  label={`${t.label} by email`}
                  checked={t.email}
                  disabled={t.emailLocked}
                  onChange={(v) => toggle(t.id, "email", v)}
                />
                {t.emailLocked && <Lock className="size-3.5 text-muted-foreground" aria-label="Always on" />}
                <span className="text-xs text-muted-foreground sm:hidden">Email</span>
              </div>
              <div className="flex items-center gap-2 sm:justify-center">
                <Switch
                  id={`pro-notify-${t.id}-text`}
                  label={`${t.label} by text`}
                  checked={t.text}
                  onChange={(v) => toggle(t.id, "text", v)}
                />
                <span className="text-xs text-muted-foreground sm:hidden">Text</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="grid gap-4 px-6 sm:grid-cols-2">
          <Field id="pro-reminder-lead" label="When should we flag a client deadline?">
            <select
              id="pro-reminder-lead"
              value={lead}
              onChange={(e) => {
                setLead(Number(e.target.value));
                setJustSaved(false);
              }}
              className={cn(selectClass, "w-full")}
            >
              {proReminderLeadDays.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? "day" : "days"} before
                </option>
              ))}
            </select>
          </Field>
          <Field id="pro-quiet-hours" label="Quiet hours" hint="Same-day escalations ignore quiet hours. They have to.">
            <select
              id="pro-quiet-hours"
              value={quiet}
              onChange={(e) => {
                setQuiet(e.target.value);
                setJustSaved(false);
              }}
              className={cn(selectClass, "w-full")}
            >
              {QUIET_HOURS.map((q) => (
                <option key={q} value={q}>
                  {q}
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
              setQuiet(saved.quiet);
              setJustSaved(false);
            }}
          >
            Discard
          </Button>
          <Button
            disabled={!dirty}
            onClick={() => {
              setSaved({ topics, lead, quiet });
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
