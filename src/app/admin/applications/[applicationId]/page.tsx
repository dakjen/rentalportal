import { db } from "@/db";
import {
  applications,
  applicationForms,
  applicationQuestions,
  questions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: {
    applicationId: string;
  };
};

export default async function ApplicationPage({ params }: PageProps) {
  const applicationId = parseInt(params.applicationId);

  const application = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .innerJoin(applicationForms, eq(applications.formId, applicationForms.id))
    .then((res) => res[0]);

  if (!application) {
    return <div>Application not found</div>;
  }

  const formQuestions = await db
    .select()
    .from(applicationQuestions)
    .where(eq(applicationQuestions.formId, application.application_forms.id))
    .innerJoin(questions, eq(applicationQuestions.questionId, questions.id))
    .orderBy(applicationQuestions.order);

  const answers = application.applications.answers as Record<number, string>;
  const fileUrl = application.applications.fileUrl;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Application for {application.application_forms.name}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Submitted at: {application.applications.createdAt.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formQuestions.map(({ questions: question }) => (
                <TableRow key={question.id}>
                  <TableCell>{question.text}</TableCell>
                  <TableCell>
                    {question.type === "secure_document_upload" || question.type === "document_upload" ? (
                      <a href={answers[question.id]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View Document
                      </a>
                    ) : (
                      answers[question.id] || "Not answered"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {fileUrl && (
            <div className="pt-4">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Button>View Main Document</Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
