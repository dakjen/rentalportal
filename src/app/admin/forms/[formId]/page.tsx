import { db } from "@/db";
import { applicationForms, questions, applicationQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type PageProps = {
  params: {
    formId: string;
  };
};

export default async function FormPage({ params }: PageProps) {
  const formId = parseInt(params.formId);

  const form = await db
    .select()
    .from(applicationForms)
    .where(eq(applicationForms.id, formId))
    .then((res) => res[0]);

  const formQuestions = await db
    .select()
    .from(applicationQuestions)
    .where(eq(applicationQuestions.formId, formId))
    .innerJoin(questions, eq(applicationQuestions.questionId, questions.id))
    .orderBy(applicationQuestions.order);

  async function addQuestion(formData: FormData) {
    "use server";
    const text = formData.get("text") as string;
    const type = formData.get("type") as string;
    const options = formData.get("options") as string;

    const [newQuestion] = await db
      .insert(questions)
      .values({ text, type, options: options ? JSON.parse(options) : null })
      .returning();

    await db.insert(applicationQuestions).values({
      formId,
      questionId: newQuestion.id,
      order: formQuestions.length + 1,
    });

    revalidatePath(`/admin/forms/${formId}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Form: {form.name}</h1>
      <p>Shareable Link: /apply/{form.shareableLink}</p>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Add Question</h2>
        <form action={addQuestion} className="flex flex-col gap-4 mt-4">
          <input type="text" name="text" placeholder="Question Text" className="border p-2" />
          <select name="type" className="border p-2">
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="radio">Radio</option>
            <option value="checkbox">Checkbox</option>
          </select>
          <textarea name="options" placeholder="Options (JSON array)" className="border p-2"></textarea>
          <button type="submit" className="bg-blue-500 text-white p-2">
            Add Question
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Questions</h2>
        <ul>
          {formQuestions.map(({ questions: question, application_questions: appQuestion }) => (
            <li key={appQuestion.id}>
              {appQuestion.order}. {question.text} ({question.type})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
