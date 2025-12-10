import { db } from "@/db";
import {
  applications,
  applicationForms,
  applicationQuestions,
  questions,
} from "@/db/schema";
import { eq } from "drizzle-orm";

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

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Application for {application.application_forms.name}
      </h1>
      <p>Submitted at: {application.applications.createdAt.toLocaleString()}</p>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Answers</h2>
        <ul>
          {formQuestions.map(({ questions: question }) => (
            <li key={question.id}>
              <strong>{question.text}: </strong>
              {answers[question.id] || "Not answered"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
