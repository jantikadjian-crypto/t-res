"use client";

import { useState } from "react";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { textareaClass } from "@/components/form";
import { useCase } from "@/components/case-provider";
import { formatDate } from "@/lib/format";
import { enrolledAgent, taxpayer, type DocumentNote } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const MAX_NOTE = 1000;

const authors: Record<DocumentNote["author"], { name: string; role: string; initials: string; avatar: string }> = {
  you: {
    name: `${taxpayer.firstName} ${taxpayer.lastName}`,
    role: "You",
    initials: `${taxpayer.firstName[0]}${taxpayer.lastName[0]}`,
    avatar: "bg-muted text-foreground",
  },
  ea: {
    name: enrolledAgent.name,
    role: enrolledAgent.credential,
    initials: enrolledAgent.name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .replace(/[^A-Z]/gi, "")
      .slice(0, 2)
      .toUpperCase(),
    avatar: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
};

function NoteItem({ docId, note }: { docId: string; note: DocumentNote }) {
  const { editNote, deleteNote } = useCase();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const author = authors[note.author];
  const mine = note.author === "you";

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    editNote(docId, note.id, trimmed.slice(0, MAX_NOTE));
    setEditing(false);
  };

  return (
    <li className="flex gap-3">
      <span aria-hidden className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold", author.avatar)}>
        {author.initials}
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium">{author.name}</span>
          <span className="text-xs text-muted-foreground">
            {author.role} · {formatDate(note.date)}
            {note.editedOn && " · edited"}
          </span>
        </div>

        {editing ? (
          <div className="space-y-2">
            <label htmlFor={`note-edit-${note.id}`} className="sr-only">
              Edit note
            </label>
            <textarea
              id={`note-edit-${note.id}`}
              rows={3}
              maxLength={MAX_NOTE}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  save();
                }
                if (e.key === "Escape") {
                  setText(note.text);
                  setEditing(false);
                }
              }}
              className={textareaClass}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={!text.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setText(note.text);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm break-words whitespace-pre-wrap">{note.text}</p>
        )}

        {mine &&
          !editing &&
          (confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-2 text-xs" role="alert">
              <span>Delete this note?</span>
              <Button size="xs" variant="destructive" onClick={() => deleteNote(docId, note.id)}>
                Delete
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setText(note.text);
                  setEditing(true);
                }}
              >
                <Pencil aria-hidden />
                Edit
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setConfirmingDelete(true)}>
                <Trash2 aria-hidden />
                Delete
              </Button>
            </div>
          ))}
      </div>
    </li>
  );
}

export function DocumentNotes({ docId }: { docId: string }) {
  const { notesFor, addNote } = useCase();
  const notes = [...notesFor(docId)].sort((a, b) => a.date.localeCompare(b.date));
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addNote(docId, trimmed.slice(0, MAX_NOTE));
    setDraft("");
  };

  return (
    <Card id="notes" className="scroll-mt-24">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" aria-hidden />
          Notes
          <span className="rounded-md bg-muted px-1.5 text-xs font-semibold text-muted-foreground tabular-nums">
            {notes.length}
          </span>
        </CardTitle>
        <CardDescription>
          Shared with {enrolledAgent.name}, your {enrolledAgent.credential}. You can edit or delete your own notes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notes yet. Add anything {enrolledAgent.name} should know: where this came from, what&apos;s missing, or a
            question.
          </p>
        ) : (
          <ol className="space-y-5" aria-label="Notes">
            {notes.map((n) => (
              <NoteItem key={n.id} docId={docId} note={n} />
            ))}
          </ol>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <label htmlFor={`note-new-${docId}`} className="text-sm font-medium">
          Add a note
        </label>
        <textarea
          id={`note-new-${docId}`}
          rows={3}
          maxLength={MAX_NOTE}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="e.g. The DoorDash 1099 is in the Dasher app. I'll add it tonight."
          className={cn(textareaClass, "bg-background")}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {draft.length}/{MAX_NOTE} · Ctrl + Enter to add
          </span>
          <Button onClick={submit} disabled={!draft.trim()}>
            Add note
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
