import React from 'react';
import { ContentPage } from './HelpPage';
import { colors } from '../styles';

export default function TermsPage({ onBack }) {
  return (
    <ContentPage title="Terms and Conditions" onBack={onBack}>
      <p style={meta}>Dynamic Pricing Sandbox — Last Updated: March 2026</p>

      <p style={body}>
        Please read these Terms and Conditions ("Terms") carefully before using the Dynamic Pricing
        Sandbox application ("Application"). By accessing or using the Application, you agree to be
        bound by these Terms. If you do not agree, you must not access or use the Application.
      </p>

      <H2>1. Author and Rights Holder</H2>
      <p style={body}>
        This Application is developed and maintained by Dr. Jose Mendoza. All correspondence
        regarding these Terms, the Application, or requests for authorization should be directed to:
      </p>
      <p style={body}>
        <strong>Dr. Jose Mendoza</strong><br />
        Email: jose.mendoza@nyu.edu<br />
        Alternate Email: josermendoza@icloud.com
      </p>

      <H2>2. Description of the Application</H2>
      <p style={body}>
        The Dynamic Pricing Sandbox is a browser-based educational simulation tool designed to teach
        the fundamentals of dynamic pricing strategy. Users interact with simulated market scenarios
        across multiple industries, adjusting pricing variables and observing the effects on demand,
        revenue, and customer sentiment. The Application is provided solely for educational and
        non-commercial purposes.
      </p>

      <H2>3. Authorization Required</H2>
      <p style={body}>
        Access to and use of this Application requires express written authorization from Dr. Jose
        Mendoza. Unauthorized access is strictly prohibited. Written authorization may be granted
        via email, signed letter, or any other documented written communication from Dr. Jose
        Mendoza. Verbal permission does not constitute authorization. If you have not received
        written authorization, you must not use the Application and must cease access immediately.
      </p>

      <H2>4. License</H2>
      <h4 style={subheading}>4.1 MIT License</h4>
      <p style={body}>
        The source code of this Application is licensed under the MIT License.
      </p>
      <blockquote style={quote}>
        Copyright (c) 2026 Dr. Jose Mendoza<br /><br />
        Permission is hereby granted, free of charge, to any person obtaining a copy of this software
        and associated documentation files (the "Software"), to deal in the Software without restriction,
        including without limitation the rights to use, copy, modify, merge, publish, distribute,
        sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:<br /><br />
        The above copyright notice and this permission notice shall be included in all copies or
        substantial portions of the Software.<br /><br />
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
        BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
        NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      </blockquote>

      <h4 style={subheading}>4.2 Attribution Requirement</h4>
      <p style={body}>
        Any use, distribution, reproduction, or derivative work based on this Application must include
        clear and visible attribution to Dr. Jose Mendoza as the original author. Attribution must
        include, at minimum, the author's name and a reference to the original source repository.
      </p>

      <H2>5. Educational and Non-Commercial Use</H2>
      <p style={body}>
        The Application is intended exclusively for educational and non-commercial purposes, including
        but not limited to classroom instruction, academic research, self-directed learning, and
        institutional training programs.
      </p>

      <H2>6. Simulation Disclaimer</H2>
      <p style={body}>
        All scenarios, data, market events, competitor behaviors, demand curves, and other elements
        presented within the Application are entirely simulated and fictitious. They are designed for
        educational illustration only and do not represent real market conditions, real companies, or
        real economic outcomes. No output from the Application should be interpreted as financial
        advice, pricing guidance, or a recommendation for any real-world business decision.
      </p>

      <H2>7. Disclaimer of Warranties</H2>
      <p style={bodyUpper}>
        THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
        WHETHER EXPRESS, IMPLIED, OR STATUTORY. DR. JOSE MENDOZA DISCLAIMS ALL WARRANTIES, INCLUDING
        BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        NON-INFRINGEMENT, AND ACCURACY.
      </p>

      <H2>8. Limitation of Liability</H2>
      <p style={bodyUpper}>
        IN NO EVENT SHALL DR. JOSE MENDOZA BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE
        OF THE APPLICATION. DR. JOSE MENDOZA'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED ZERO
        DOLLARS ($0.00).
      </p>

      <H2>9. Governing Law</H2>
      <p style={body}>
        These Terms shall be governed by and construed in accordance with the laws of the State
        of New York, United States, without regard to its conflict of law principles.
      </p>
    </ContentPage>
  );
}

function H2({ children }) {
  return (
    <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginTop: 24, marginBottom: 8 }}>
      {children}
    </h3>
  );
}

const body = { fontSize: 14, lineHeight: 1.7, color: colors.text, marginBottom: 12 };
const bodyUpper = { ...body, fontSize: 12, lineHeight: 1.6 };
const meta = { fontSize: 12, color: colors.textSecondary, marginBottom: 20, fontStyle: 'italic' };
const subheading = { fontSize: 14, fontWeight: 600, color: colors.text, marginTop: 12, marginBottom: 6 };
const quote = {
  margin: '12px 0',
  padding: '12px 16px',
  borderLeft: `3px solid ${colors.border}`,
  fontSize: 12,
  lineHeight: 1.6,
  color: colors.textSecondary,
  background: '#f8fafc',
  borderRadius: '0 8px 8px 0',
};
