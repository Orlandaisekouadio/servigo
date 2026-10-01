// Carte-section réutilisable des espaces : icône, titre, description, badge optionnel.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export default function SectionCard({ icon, title, description, badge, children, className }) {
  return (
    <Card className={className ?? 'mb-6'}>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </span>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
          </div>
        </div>
        {badge}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}