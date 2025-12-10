export const applicationForms = [
  { id: 1, name: "Default Apartment Application", shareableLink: "default-form" },
];

export const questions = [
  { id: 1, text: "Full Name", type: "text", options: null },
  { id: 2, text: "Email Address", type: "text", options: null },
  {
    id: 3,
    text: "Do you have pets?",
    type: "radio",
    options: ["Yes", "No"],
  },
];

export const applicationQuestions = [
  { id: 1, formId: 1, questionId: 1, order: 1 },
  { id: 2, formId: 1, questionId: 2, order: 2 },
  { id: 3, formId: 1, questionId: 3, order: 3 },
];

export const applications = [];

export const db = {
  select: () => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        innerJoin: (table2: any, condition2: any) => ({
          orderBy: (order: any) => {
            if (table === applicationQuestions) {
              return applicationQuestions
                .filter((aq) => aq.formId === 1)
                .map((aq) => ({
                  questions: questions.find((q) => q.id === aq.questionId),
                  application_questions: aq,
                }));
            }
            return [];
          },
        }),
        then: (cb: any) => {
          if (table === applicationForms) {
            return cb(applicationForms);
          }
          return cb([]);
        },
      }),
    }),
  }),
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: () => {
        if (table === questions) {
          const newQuestion = { ...data, id: questions.length + 1 };
          questions.push(newQuestion);
          return [newQuestion];
        }
        return [];
      },
    }),
  }),
};
