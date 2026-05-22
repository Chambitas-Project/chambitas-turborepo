import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Link,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a Chambitas, {userName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
             {/* Reemplazar con el logo real de Chambitas cuando esté disponible */}
            <Heading style={h1}>CHAMBITAS</Heading>
          </Section>
          <Heading style={h1}>¡Hola, {userName}!</Heading>
          <Text style={text}>
            Estamos muy emocionados de tenerte en la comunidad de Chambitas. 
            Aquí podrás encontrar los mejores proyectos para potenciar tu carrera profesional.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href="https://chambitas.com/dashboard">
              Explorar Proyectos
            </Link>
          </Section>
          <Text style={footer}>
            Si no creaste esta cuenta, puedes ignorar este correo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
    padding: '32px',
    textAlign: 'center' as const,
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  padding: '0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '48px',
};
