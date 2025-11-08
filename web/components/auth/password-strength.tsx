"use client";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = (pwd: string): {
    score: number;
    label: string;
    color: string;
    requirements: Array<{ met: boolean; text: string }>;
  } => {
    let score = 0;
    const requirements = [
      { met: pwd.length >= 8, text: "Najmanje 8 karaktera" },
      { met: /[a-z]/.test(pwd), text: "Jedno malo slovo" },
      { met: /[A-Z]/.test(pwd), text: "Jedno veliko slovo" },
      { met: /[0-9]/.test(pwd), text: "Jedan broj" },
    ];

    requirements.forEach((req) => {
      if (req.met) score++;
    });

    let label = "Slaba";
    let color = "bg-destructive";

    if (score === 4) {
      label = "Jaka";
      color = "bg-green-500";
    } else if (score === 3) {
      label = "Dobra";
      color = "bg-yellow-500";
    } else if (score === 2) {
      label = "Srednja";
      color = "bg-orange-500";
    }

    return { score, label, color, requirements };
  };

  const { score, label, color, requirements } = getStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Jačina šifre:</span>
        <span className="font-medium">{label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-1.5 ${
              req.met ? "text-green-600 dark:text-green-400" : ""
            }`}
          >
            <span>{req.met ? "✓" : "○"}</span>
            <span>{req.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


