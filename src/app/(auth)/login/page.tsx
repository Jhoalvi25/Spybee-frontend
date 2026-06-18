'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowLeft, BarChart3, Map, Check } from 'lucide-react';
import { useAuthStore } from '@/domain/auth/store';
import styles from './page.module.scss';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const BULLETS = [
  'Dashboard en tiempo real',
  'Mapa geográfico interactivo',
  'Gestión inteligente de incidencias',
  'Supervisión basada en IA',
];

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
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.heroTag}>Spybee</div>
          <h1 className={styles.heroTitle}>
            Supervisa tu obra<br />
            en <span className={styles.yellow}>tiempo real</span>
          </h1>
          <p className={styles.heroSub}>
            Centraliza incidencias, mapas, drones y analítica de construcción
            en una sola plataforma impulsada por IA.
          </p>

          <ul className={styles.bullets}>
            {BULLETS.map((b) => (
              <li key={b} className={styles.bullet}>
                <span className={styles.bulletIcon}>
                  <Check size={14} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className={styles.mockups}>
            <div className={styles.mockupCard}>
              <div className={styles.mockupCardHeader}>
                <BarChart3 size={14} />
                <span>Dashboard</span>
              </div>
              <div className={styles.mockupBars}>
                {[45, 70, 35, 85, 55, 65].map((h, i) => (
                  <div key={i} className={styles.mockupBar} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className={styles.mockupCard}>
              <div className={styles.mockupCardHeader}>
                <Map size={14} />
                <span>Mapa</span>
              </div>
              <div className={styles.mockupMapGrid} />
              <div className={styles.mockupPin} style={{ top: '35%', left: '45%' }} />
              <div className={styles.mockupPin} style={{ top: '60%', left: '30%' }} />
              <div className={styles.mockupPin} style={{ top: '40%', left: '70%' }} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.loginSection}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <img
              src="https://framerusercontent.com/images/KMIp6oxIY5aDYfDah2Rt0hoPC0.png?width=1818&height=900"
              alt="Spybee"
              className={styles.logo}
            />
            <h2 className={styles.cardTitle}>Inicia sesión</h2>
            <p className={styles.cardSub}>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="admin@spybee.com"
                  {...register('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className={styles.error}>{errors.email.message}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="password"
                  type="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="••••••"
                  {...register('password')}
                  autoComplete="current-password"
                />
              </div>
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

          <div className={styles.hint}>
            <span className={styles.hintLabel}>Credenciales de demo</span>
            <code className={styles.hintCode}>admin@spybee.com</code>
            <span className={styles.hintSep}>/</span>
            <code className={styles.hintCode}>123456</code>
          </div>

          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={14} />
            Volver al inicio
          </Link>
        </div>
      </section>
    </div>
  );
}
