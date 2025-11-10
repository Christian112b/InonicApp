import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { ToastController, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, refreshOutline, documentTextOutline, callOutline, helpCircleOutline, chevronForwardOutline } from 'ionicons/icons';
import { PrivacyPolicyModalComponent } from '../modals/privacy-policy-modal.component';
import { ReturnsPolicyModalComponent } from '../modals/returns-policy-modal.component';
import { TermsOfServiceModalComponent } from '../modals/terms-of-service-modal.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule],
  providers: [ModalController]
})
export class Tab5Page implements OnInit {
  privacyPolicyClicked = false;
  returnsPolicyClicked = false;
  termsOfServiceClicked = false;

  constructor(private toastController: ToastController, private modalController: ModalController) {
    addIcons({
      shieldCheckmarkOutline,
      refreshOutline,
      documentTextOutline,
      callOutline,
      helpCircleOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
  }

  async openPrivacyPolicy() {
    console.log('Opening privacy policy modal - START');

    try {
      console.log('About to call modalController.create...');

      // Try with a timeout to see if it hangs
      const createPromise = this.modalController.create({
        component: PrivacyPolicyModalComponent,
        cssClass: 'policy-modal',
        backdropDismiss: true
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Modal create timeout')), 5000)
      );

      const modal = await Promise.race([createPromise, timeoutPromise]) as any;
      console.log('modalController.create() completed successfully');

      console.log('Presenting modal...');
      await modal.present();
      console.log('Privacy policy modal presented - SUCCESS');

      // Remove debug indicator when modal closes
      modal.onDidDismiss().then(() => {
        console.log('Privacy policy modal dismissed');
      });

    } catch (error) {
      console.error('Error opening privacy policy modal:', error);

      // Try alternative: custom modal using div
      console.log('Trying custom div modal...');
      this.showCustomModal('Política de Privacidad', this.getPrivacyPolicyContent());
    }
  }

  private getPrivacyPolicyContent(): string {
    return `
      <h1>Políticas de Uso y Aviso de Privacidad</h1>
      <p class="subtitle">En Constanzo, tu privacidad y confianza son nuestra prioridad</p>
      <p class="date">Última actualización: 19 de octubre de 2025</p>

      <div class="policy-section">
        <h2>1. Introducción</h2>
        <p>
          Constanzo Chocolates Artesanales, con domicilio en San Luis Potosí, México, es responsable del tratamiento de sus datos personales...
        </p>
      </div>

      <div class="policy-section">
        <h2>2. Datos Personales Recopilados</h2>
        <ul>
          <li>Datos de identificación: nombre completo, fecha de nacimiento</li>
          <li>Datos de contacto: dirección, correo electrónico, teléfono</li>
          <li>Datos de facturación: RFC, razón social, domicilio fiscal</li>
          <li>Datos de navegación: dirección IP, cookies, historial de compras</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>3. Finalidades del Tratamiento</h2>
        <h3>Finalidades Primarias:</h3>
        <ul>
          <li>Procesar y entregar sus pedidos</li>
          <li>Emitir facturas</li>
          <li>Gestionar pagos</li>
          <li>Atender consultas</li>
        </ul>
        <h3>Finalidades Secundarias:</h3>
        <ul>
          <li>Enviar promociones</li>
          <li>Realizar encuestas</li>
          <li>Mejorar servicios</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>4. Compartición de Datos</h2>
        <ul>
          <li>Empresas de mensajería</li>
          <li>Instituciones financieras</li>
          <li>Autoridades competentes</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>5. Derechos ARCO</h2>
        <p>Puede ejercer sus derechos enviando una solicitud a:</p>
        <div class="contact-info">
          <p><strong>Correo:</strong> privacidad@constanzo.com</p>
          <p><strong>Domicilio:</strong> Departamento de Protección de Datos, San Luis Potosí</p>
        </div>
      </div>

      <div class="policy-section">
        <h2>6. Cookies y Tecnologías de Rastreo</h2>
        <p>Este sitio utiliza cookies para mejorar la experiencia de navegación...</p>
      </div>

      <div class="policy-section">
        <h2>7. Seguridad de Datos</h2>
        <p>Implementamos medidas de seguridad administrativas, técnicas y físicas...</p>
      </div>

      <div class="policy-section">
        <h2>8. Cambios al Aviso de Privacidad</h2>
        <p>Nos reservamos el derecho de modificar este aviso en cualquier momento...</p>
      </div>

      <div class="contact-section">
        <p><strong>¿Tiene preguntas sobre nuestras políticas?</strong></p>
        <p>Contáctenos en <a href="mailto:privacidad@constanzo.com">privacidad@constanzo.com</a></p>
      </div>
    `;
  }

  private getReturnsPolicyContent(): string {
    return `
      <h1>Políticas de Devolución, Entregas y Reembolsos</h1>
      <p class="subtitle">Tu satisfacción es nuestra prioridad. Conoce nuestras políticas de servicio</p>
      <p class="date">Última actualización: 19 de octubre de 2025</p>

      <div class="policy-section">
        <h2>1. Política de Entregas</h2>
        <h3>Tiempos de Entrega:</h3>
        <ul>
          <li>San Luis Potosí: 24–48 horas hábiles</li>
          <li>Área Metropolitana: 2–4 días hábiles</li>
          <li>Interior de la República: 3–7 días hábiles</li>
          <li>Pedidos especiales: 5–10 días hábiles</li>
        </ul>
        <h3>Costos de Envío:</h3>
        <ul>
          <li>Envío gratis en compras mayores a $800 MXN</li>
          <li>Costo estándar: $120 MXN</li>
          <li>Interior: $180–$250 MXN</li>
        </ul>
        <h3>Condiciones:</h3>
        <p>Usamos empaques térmicos. Es importante refrigerar los productos al recibirlos.</p>
      </div>

      <div class="policy-section">
        <h2>2. Política de Devoluciones</h2>
        <h3>Productos elegibles:</h3>
        <ul>
          <li>Dañado en envío</li>
          <li>Defectuoso</li>
          <li>Incorrecto</li>
          <li>Vencido o próximo a vencer</li>
        </ul>
        <h3>Plazo:</h3>
        <p>Debe reportarse dentro de las 24 horas posteriores a la recepción.</p>
        <h3>No elegibles:</h3>
        <ul>
          <li>Personalizados</li>
          <li>En promoción</li>
          <li>Consumidos</li>
          <li>Sin empaque original</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>3. Proceso de Devolución</h2>
        <ol>
          <li><strong>Contacto:</strong> Enviar correo con evidencia</li>
          <li><strong>Evaluación:</strong> Respuesta en 24h</li>
          <li><strong>Recolección:</strong> Coordinación sin costo</li>
          <li><strong>Resolución:</strong> Reembolso o reemplazo</li>
        </ol>
      </div>

      <div class="policy-section">
        <h2>4. Política de Reembolsos</h2>
        <h3>Métodos:</h3>
        <ul>
          <li>Tarjeta: 5–10 días</li>
          <li>Transferencia: 3–5 días</li>
          <li>Crédito en tienda: inmediato</li>
        </ul>
        <h3>Monto:</h3>
        <p>Incluye producto y envío si el error fue nuestro.</p>
        <h3>Reemplazos:</h3>
        <p>Se envían sin costo adicional en 2–3 días hábiles.</p>
      </div>

      <div class="policy-section">
        <h2>5. Cancelaciones</h2>
        <p><strong>Antes de producción:</strong> Cancelable dentro de 2h</p>
        <p><strong>Personalizados:</strong> No cancelables</p>
        <p><strong>En tránsito:</strong> Puede rechazarse, aplican cargos</p>
      </div>

      <div class="policy-section">
        <h2>6. Garantía de Calidad</h2>
        <p>Garantizamos calidad artesanal. Si no estás satisfecho, buscamos solución.</p>
      </div>

      <div class="policy-section">
        <h2>7. Casos Especiales</h2>
        <ul>
          <li>Problemas con paquetería</li>
          <li>Alergias e intolerancias</li>
          <li>Eventos climáticos</li>
        </ul>
      </div>

      <div class="contact-section">
        <h3>Información de Contacto</h3>
        <ul>
          <li><strong>Correo:</strong> devoluciones@constanzo.com</li>
          <li><strong>Teléfono:</strong> +52 (444) 1234-5678</li>
          <li><strong>WhatsApp:</strong> +52 (444) 9876-5432</li>
          <li><strong>Horario:</strong> Lun–Vie: 9:00–18:00 hrs</li>
        </ul>
      </div>
    `;
  }

  private getTermsOfServiceContent(): string {
    return `
      <h1>Términos y Condiciones de Servicio</h1>
      <p class="subtitle">Condiciones generales de uso de la aplicación Costanzo</p>
      <p class="date">Última actualización: 19 de octubre de 2025</p>

      <div class="policy-section">
        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al acceder y utilizar la aplicación móvil Costanzo Chocolates Artesanales, usted acepta y se compromete a cumplir con los términos y condiciones de este acuerdo.
        </p>
      </div>

      <div class="policy-section">
        <h2>2. Descripción del Servicio</h2>
        <p>
          Costanzo es una aplicación móvil que permite a los usuarios explorar, seleccionar y adquirir productos artesanales de chocolate, gestionar su carrito de compras y realizar pedidos en línea.
        </p>
      </div>

      <div class="policy-section">
        <h2>3. Registro y Cuenta de Usuario</h2>
        <h3>Registro:</h3>
        <ul>
          <li>Para realizar compras, debe crear una cuenta proporcionando información veraz y actualizada</li>
          <li>Es responsable de mantener la confidencialidad de su contraseña</li>
          <li>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
        </ul>
        <h3>Responsabilidades:</h3>
        <ul>
          <li>Mantener actualizada su información personal</li>
          <li>Utilizar la aplicación de manera responsable y legal</li>
          <li>No compartir credenciales de acceso</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>4. Productos y Precios</h2>
        <h3>Productos:</h3>
        <ul>
          <li>Todos los productos están sujetos a disponibilidad</li>
          <li>Las imágenes son representativas y pueden variar ligeramente</li>
          <li>Nos reservamos el derecho de modificar productos sin previo aviso</li>
        </ul>
        <h3>Precios:</h3>
        <ul>
          <li>Los precios están en pesos mexicanos e incluyen IVA</li>
          <li>Nos reservamos el derecho de cambiar precios sin previo aviso</li>
          <li>Los precios publicados al momento de la compra son los válidos</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>5. Proceso de Compra</h2>
        <ol>
          <li><strong>Selección:</strong> Agregue productos a su carrito</li>
          <li><strong>Revisión:</strong> Verifique su pedido y dirección de entrega</li>
          <li><strong>Pago:</strong> Complete el pago de forma segura</li>
          <li><strong>Confirmación:</strong> Recibirá un comprobante de su pedido</li>
          <li><strong>Entrega:</strong> Reciba su pedido en el tiempo establecido</li>
        </ol>
      </div>

      <div class="policy-section">
        <h2>6. Métodos de Pago</h2>
        <p>Aceptamos los siguientes métodos de pago:</p>
        <ul>
          <li>Tarjetas de crédito y débito (Visa, MasterCard, American Express)</li>
          <li>Transferencias bancarias</li>
          <li>PayPal y otros métodos electrónicos</li>
          <li>Efectivo contra entrega (sujeto a disponibilidad)</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>7. Envíos y Entregas</h2>
        <h3>Zonas de entrega:</h3>
        <ul>
          <li>Ciudad de México y Área Metropolitana</li>
          <li>Interior de la República Mexicana</li>
          <li>Entregas express disponibles en ciertas zonas</li>
        </ul>
        <h3>Tiempos de entrega:</h3>
        <ul>
          <li>24-48 horas hábiles en CDMX</li>
          <li>2-4 días hábiles en Área Metropolitana</li>
          <li>3-7 días hábiles en interior de la República</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>8. Cancelaciones y Devoluciones</h2>
        <p>Consulte nuestra política de devoluciones para información detallada sobre:</p>
        <ul>
          <li>Cancelación de pedidos</li>
          <li>Devolución de productos</li>
          <li>Reembolsos y créditos</li>
          <li>Casos especiales</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>9. Uso Aceptable</h2>
        <p>Usted se compromete a:</p>
        <ul>
          <li>Utilizar la aplicación únicamente para fines legales</li>
          <li>No interferir con el funcionamiento normal de la aplicación</li>
          <li>No intentar acceder a áreas restringidas del sistema</li>
          <li>Respetar los derechos de propiedad intelectual</li>
          <li>No utilizar la aplicación para fines comerciales no autorizados</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>10. Propiedad Intelectual</h2>
        <p>
          Todo el contenido de la aplicación, incluyendo pero no limitado a textos, imágenes, logotipos, gráficos y software, está protegido por leyes de propiedad intelectual y pertenece a Costanzo Chocolates Artesanales.
        </p>
      </div>

      <div class="policy-section">
        <h2>11. Limitación de Responsabilidad</h2>
        <p>
          Costanzo no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la aplicación. Nuestra responsabilidad máxima se limita al monto pagado por el usuario.
        </p>
      </div>

      <div class="policy-section">
        <h2>12. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación en la aplicación.
        </p>
      </div>

      <div class="policy-section">
        <h2>13. Ley Aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa será resuelta en los tribunales competentes de San Luis Potosí.
        </p>
      </div>

      <div class="contact-section">
        <h3>Información de Contacto</h3>
        <p>Para preguntas sobre estos términos, contáctenos en:</p>
        <ul>
          <li><strong>Email:</strong> legal@constanzo.com</li>
          <li><strong>Teléfono:</strong> +52 (444) 1234-5678</li>
          <li><strong>Dirección:</strong> San Luis Potosí, México</li>
        </ul>
      </div>
    `;
  }

  private showCustomModal(title: string, content: string) {
    // Create custom modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 20px;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    `;

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0;
      color: #8B4513;
      font-size: 18px;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create content with full privacy policy text
    const contentElement = document.createElement('div');
    contentElement.innerHTML = `
      <h1>Políticas de Uso y Aviso de Privacidad</h1>
      <p class="subtitle">En Constanzo, tu privacidad y confianza son nuestra prioridad</p>
      <p class="date">Última actualización: 19 de octubre de 2025</p>

      <div class="policy-section">
        <h2>1. Introducción</h2>
        <p>
          Constanzo Chocolates Artesanales, con domicilio en San Luis Potosí, México, es responsable del tratamiento de sus datos personales...
        </p>
      </div>

      <div class="policy-section">
        <h2>2. Datos Personales Recopilados</h2>
        <ul>
          <li>Datos de identificación: nombre completo, fecha de nacimiento</li>
          <li>Datos de contacto: dirección, correo electrónico, teléfono</li>
          <li>Datos de facturación: RFC, razón social, domicilio fiscal</li>
          <li>Datos de navegación: dirección IP, cookies, historial de compras</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>3. Finalidades del Tratamiento</h2>
        <h3>Finalidades Primarias:</h3>
        <ul>
          <li>Procesar y entregar sus pedidos</li>
          <li>Emitir facturas</li>
          <li>Gestionar pagos</li>
          <li>Atender consultas</li>
        </ul>
        <h3>Finalidades Secundarias:</h3>
        <ul>
          <li>Enviar promociones</li>
          <li>Realizar encuestas</li>
          <li>Mejorar servicios</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>4. Compartición de Datos</h2>
        <ul>
          <li>Empresas de mensajería</li>
          <li>Instituciones financieras</li>
          <li>Autoridades competentes</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>5. Derechos ARCO</h2>
        <p>Puede ejercer sus derechos enviando una solicitud a:</p>
        <div class="contact-info">
          <p><strong>Correo:</strong> privacidad@constanzo.com</p>
          <p><strong>Domicilio:</strong> Departamento de Protección de Datos, San Luis Potosí</p>
        </div>
      </div>

      <div class="policy-section">
        <h2>6. Cookies y Tecnologías de Rastreo</h2>
        <p>Este sitio utiliza cookies para mejorar la experiencia de navegación...</p>
      </div>

      <div class="policy-section">
        <h2>7. Seguridad de Datos</h2>
        <p>Implementamos medidas de seguridad administrativas, técnicas y físicas...</p>
      </div>

      <div class="policy-section">
        <h2>8. Cambios al Aviso de Privacidad</h2>
        <p>Nos reservamos el derecho de modificar este aviso en cualquier momento...</p>
      </div>

      <div class="contact-section">
        <p><strong>¿Tiene preguntas sobre nuestras políticas?</strong></p>
        <p>Contáctenos en <a href="mailto:privacidad@constanzo.com">privacidad@constanzo.com</a></p>
      </div>
    `;
    contentElement.style.cssText = `
      line-height: 1.5;
      color: #333;
    `;

    // Add some basic styling for the content
    const style = document.createElement('style');
    style.textContent = `
      .policy-section { margin-bottom: 20px; }
      .policy-section h2 { color: #8B4513; font-size: 16px; margin-bottom: 8px; }
      .policy-section h3 { color: #D2691E; font-size: 14px; margin: 12px 0 8px 0; }
      .policy-section ul { margin: 8px 0; padding-left: 20px; }
      .policy-section li { margin-bottom: 4px; }
      .contact-info { background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 8px 0; }
      .contact-section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
      .subtitle { color: #666; font-style: italic; margin: 8px 0 16px 0; }
      .date { color: #666; font-size: 14px; margin-bottom: 20px; }
    `;
    document.head.appendChild(style);

    // Assemble modal
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    modalContent.appendChild(header);
    modalContent.appendChild(contentElement);
    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    // Close functionality
    const closeModal = () => {
      document.body.removeChild(overlay);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };

    closeButton.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    };
  }

  async openReturnsPolicy() {
    console.log('Opening returns policy modal - START');

    try {
      console.log('About to call modalController.create...');

      // Try with a timeout to see if it hangs
      const createPromise = this.modalController.create({
        component: ReturnsPolicyModalComponent,
        cssClass: 'policy-modal',
        backdropDismiss: true
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Modal create timeout')), 5000)
      );

      const modal = await Promise.race([createPromise, timeoutPromise]) as any;
      console.log('modalController.create() completed successfully');

      console.log('Presenting modal...');
      await modal.present();
      console.log('Returns policy modal presented - SUCCESS');

      // Remove debug indicator when modal closes
      modal.onDidDismiss().then(() => {
        console.log('Returns policy modal dismissed');
      });

    } catch (error) {
      console.error('Error opening returns policy modal:', error);

      // Try alternative: custom modal with full content
      console.log('Trying custom div modal for returns policy...');
      this.showCustomModal('Políticas de Devolución', this.getReturnsPolicyContent());
    }
  }

  async openTermsOfService() {
    console.log('Opening terms of service modal - START');

    try {
      console.log('About to call modalController.create...');

      // Try with a timeout to see if it hangs
      const createPromise = this.modalController.create({
        component: TermsOfServiceModalComponent,
        cssClass: 'policy-modal',
        backdropDismiss: true
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Modal create timeout')), 5000)
      );

      const modal = await Promise.race([createPromise, timeoutPromise]) as any;
      console.log('modalController.create() completed successfully');

      console.log('Presenting modal...');
      await modal.present();
      console.log('Terms of service modal presented - SUCCESS');

      // Remove debug indicator when modal closes
      modal.onDidDismiss().then(() => {
        console.log('Terms of service modal dismissed');
      });

    } catch (error) {
      console.error('Error opening terms of service modal:', error);

      // Try alternative: custom modal with full content
      console.log('Trying custom div modal for terms of service...');
      this.showCustomModal('Términos de Servicio', this.getTermsOfServiceContent());
    }
  }

  async openContact() {
    this.showDevelopmentToast('Contactanos');
  }

  async openFAQ() {
    this.showDevelopmentToast('Preguntas Frecuentes');
  }

  onButtonPress(buttonType: string) {
    switch (buttonType) {
      case 'privacy':
        this.privacyPolicyClicked = true;
        break;
      case 'returns':
        this.returnsPolicyClicked = true;
        break;
      case 'terms':
        this.termsOfServiceClicked = true;
        break;
    }
  }

  onButtonRelease(buttonType: string) {
    switch (buttonType) {
      case 'privacy':
        this.privacyPolicyClicked = false;
        break;
      case 'returns':
        this.returnsPolicyClicked = false;
        break;
      case 'terms':
        this.termsOfServiceClicked = false;
        break;
    }
  }

  private showModalDebugIndicator(modalName: string) {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'modal-debug-indicator';
    debugDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 255, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 16px;
      z-index: 10001;
      border: 3px solid red;
    `;
    debugDiv.innerHTML = `<strong>MODAL IS OPEN!</strong><br>${modalName}`;
    document.body.appendChild(debugDiv);
  }

  private showModalErrorIndicator(modalName: string, error: any) {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'modal-debug-indicator';
    debugDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 16px;
      z-index: 10001;
      border: 3px solid yellow;
    `;
    debugDiv.innerHTML = `<strong>MODAL ERROR!</strong><br>${modalName}<br><small>${error?.message || 'Unknown error'}</small>`;
    document.body.appendChild(debugDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const indicator = document.getElementById('modal-debug-indicator');
      if (indicator) indicator.remove();
    }, 5000);
  }

  private async showDevelopmentToast(message: string) {
    const toast = await this.toastController.create({
      message: `${message} - Esta funcionalidad está en desarrollo`,
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-warning',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

}
