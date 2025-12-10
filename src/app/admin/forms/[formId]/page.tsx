import { db } from "@/db";
import { applicationForms, questions, applicationQuestions } from "@/db/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

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
      <h1 className="text-2xl font-bold mb-4">Edit Form: {form.name}</h1>
      <p className="mb-4">
        Shareable Link:{" "}
        <a
          href={`/apply/${form.shareableLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          /apply/{form.shareableLink}
        </a>
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addQuestion} className="grid grid-cols-1 gap-4">
            <Input name="text" placeholder="Question Text" />
            <Select name="type">
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              name="options"
              placeholder="Options (JSON array for radio/checkbox)"
            />
            <Button type="submit">Add Question</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Text</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formQuestions.map(({ questions: q, application_questions: aq }) => (
                <TableRow key={aq.id}>
                  <TableCell>{aq.order}</TableCell>
                  <TableCell>{q.text}</TableCell>
                  <TableCell>{q.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
