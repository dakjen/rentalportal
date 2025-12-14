"use client";

import { useState } from "react";
import { db } from "@/db";
import {
  applicationForms,
  applications,
  applicationQuestions,
  questions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

type PageProps = {
  params: {
    shareableLink: string;
  };
};

export default function ApplyPage({ params }: PageProps) {
  const { shareableLink } = params;
  const [form, setForm] = useState<any>(null);
  const [formQuestions, setFormQuestions] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      const formRes = await db
        .select()
        .from(applicationForms)
        .where(eq(applicationForms.shareableLink, shareableLink))
        .then((res) => res[0]);

      if (!formRes) {
        return;
      }
      setForm(formRes);

      const questionsRes = await db
        .select()
        .from(applicationQuestions)
        .where(eq(applicationQuestions.formId, formRes.id))
        .innerJoin(questions, eq(applicationQuestions.questionId, questions.id))
        .orderBy(applicationQuestions.order);
      setFormQuestions(questionsRes);
    }
    fetchData();
  }, [shareableLink]);

  if (!form) {
    return <div>Form not found</div>;
  }

  async function submitApplication(formData: FormData) {
    "use server";

    const answers = formQuestions.reduce((acc, { questions: question }) => {
      const answer = formData.get(String(question.id));
      if (answer) {
        acc[question.id] = answer;
      }
      return acc;
    }, {} as Record<number, FormDataEntryValue>);
    
    // Add uploaded file URLs to answers
    Object.assign(answers, uploadedFiles);

    await db.insert(applications).values({
      formId: form.id,
      answers,
    });

    revalidatePath(`/apply/${shareableLink}`);
    // You might want to redirect to a "thank you" page
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <CardDescription>
            Please fill out the application form below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitApplication} className="space-y-8">
            {formQuestions.map(({ questions: question }) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={String(question.id)}>{question.text}</Label>
                {question.type === "text" && (
                  <Input
                    type="text"
                    id={String(question.id)}
                    name={String(question.id)}
                  />
                )}
                {question.type === "textarea" && (
                  <Textarea
                    id={String(question.id)}
                    name={String(question.id)}
                  />
                )}
                {(question.type === "document_upload" || question.type === "secure_document_upload") && (
                  <UploadDropzone
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => {
                      if (res) {
                        setUploadedFiles(prev => ({
                          ...prev,
                          [question.id]: res[0].url
                        }));
                        alert("Upload Completed");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      alert(`ERROR! ${error.message}`);
                    }}
                  />
                )}
                {question.type === "radio" && (
                  <RadioGroup
                    id={String(question.id)}
                    name={String(question.id)}
                  >
                    {Array.isArray(question.options) &&
                      question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`}>
                            {option}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                )}
                {question.type === "checkbox" && (
                  <div>
                    {Array.isArray(question.options) &&
                      question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            name={String(question.id)}
                            value={option}
                          />
                          <Label htmlFor={`${question.id}-${option}`}>
                            {option}
                          </Label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
            <Button type="submit">Submit Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
