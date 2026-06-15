'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/domain/auth/store';
import styles from './page.module.scss';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      setServerError(null);
      const ok = await login(data.email, data.password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setServerError('Correo o contraseña incorrectos');
      }
    },
    [login, router]
  );

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🔷</div>
        <h1 className={styles.title}>Spybee</h1>
        <p className={styles.subtitle}>Inicia sesión en tu cuenta</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="admin@spybee.com"
              {...register('email')}
              autoComplete="email"
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••"
              {...register('password')}
              autoComplete="current-password"
            />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>

          {serverError && <p className={styles.serverError}>{serverError}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className={styles.hint}>
          Demo: <strong>admin@spybee.com</strong> / <strong>123456</strong>
        </p>

        <Link href="/" className={styles.backLink}>Volver al inicio</Link>
      </div>
    </main>
  );
}
