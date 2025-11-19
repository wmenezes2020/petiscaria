import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gastronomy-50 to-gastronomy-100 dark:from-gastronomy-950 dark:to-gastronomy-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">Página não encontrada</p>
          <Button asChild>
            <Link href="/app/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


