import * as zod from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "/images/logo.svg";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

const formSchema = zod.object({
  email: zod.email(),
  password: zod.string().min(8),
});

function RouteComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: zod.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <div className="flex items-center h-screen gap-1">
      <div className="flex flex-col gap-2 flex-1 items-center justify-center">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="OSPilot AI" width={100} height={100} />
          <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-bold">OpsPilot AI</h1>
            <p className="text-md text-muted-foreground">
              AI Copilot for your team
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg flex-1 gap-8">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-bold">
              Login to OpsPilot AI account
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Enter your email and password to login
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                </Field>
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...register("password")}
                  />
                </Field>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </FieldGroup>
              <Button size="lg" className="w-full cursor-pointer" type="submit">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
