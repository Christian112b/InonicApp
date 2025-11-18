import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonButton } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';

// Environment configuration
// const API_BASE_URL = 'https://backend-app-x7k2.zeabur.app/'; // Force HTTPS production URL for testing
const API_BASE_URL = environment.apiUrl; // Original environment-based URL

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_unitario: number;
  activo: number;
  imagen?: string;
  imagen_base64?: string;
  stock: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonButton, CommonModule]
})
export class Tab1Page implements AfterViewInit, OnDestroy {
  private currentSlide = 0;
  private slideInterval: any;
  private slides: NodeListOf<Element> | null = null;
  private dots: NodeListOf<Element> | null = null;
  public favoriteProducts: Product[] = [];
  public isLoadingProducts = false;
  public hasError = false;
  public errorMessage = '';
  public slideImages: string[] = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUU2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkR1bGNlcyAyWDE8L3RleHQ+Cjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNEREI3NjMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkR1bGNlcyBBcnRlc2FuYWxlczwvdGV4dD4KPC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUU2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMyMjhCMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVudOKDrW8gR3JhdGlzPC90ZXh0Pgo8L3N2Zz4='
  ];

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    loop: true,
    pagination: {
      clickable: true,
      dynamicBullets: false
    },
    navigation: false,
    grabCursor: true,
    effect: 'slide',
    slidesPerView: 1,
    spaceBetween: 0
  };

  constructor(private http: HttpClient, private toastController: ToastController) {
    this.loadFavoriteProducts();
  }

  ngAfterViewInit() {
    this.slides = document.querySelectorAll('.slide');
    this.dots = document.querySelectorAll('.dot');

    this.startAutoSlide();
    this.setupDotNavigation();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  private startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private nextSlide() {
    if (!this.slides || !this.dots) return;

    this.slides[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide].classList.remove('active');

    this.currentSlide = (this.currentSlide + 1) % this.slides.length;

    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');
  }

  private setupDotNavigation() {
    if (!this.dots) return;

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });

    // Add touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
    if (sliderContainer) {
      sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });

      sliderContainer.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        this.handleSwipe(startX, endX);
      });
    }
  }

  private handleSwipe(startX: number, endX: number) {
    const diff = startX - endX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.prevSlide();
      }
    }
  }

  private prevSlide() {
    if (!this.slides || !this.dots) return;

    this.slides[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide].classList.remove('active');

    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;

    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');
  }

  private goToSlide(index: number) {
    if (!this.slides || !this.dots || index === this.currentSlide) return;

    // Clear current active states
    this.slides[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide].classList.remove('active');

    // Set new active states
    this.currentSlide = index;
    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');

    // Reset auto slide timer
    clearInterval(this.slideInterval);
    this.startAutoSlide();
  }

  private loadFavoriteProducts() {
    this.isLoadingProducts = true;
    this.hasError = false;
    this.errorMessage = '';

    // Check if products are already cached
    const cachedProducts = localStorage.getItem('cachedProducts');
    const cachedCategories = localStorage.getItem('cachedCategories');

    if (cachedProducts && cachedCategories && cachedProducts !== 'undefined' && cachedCategories !== 'undefined') {
      try {
        const products = JSON.parse(cachedProducts);
        // Get first 6 products as favorites (you can modify this logic)
        this.favoriteProducts = products.slice(0, 6);
        this.isLoadingProducts = false;
        return;
      } catch (error) {
        console.warn('Error parsing cached products, fetching from API:', error);
        // Clear invalid cache
        localStorage.removeItem('cachedProducts');
        localStorage.removeItem('cachedCategories');
        this.showToast('Error al cargar productos del caché, obteniendo datos del servidor...', 'warning');
      }
    }

    // Load products from API
    const apiUrl = `${API_BASE_URL}/getProducts`;

    this.http.get<{productos: Product[], categorias: string[]}>(apiUrl).subscribe({
      next: (response) => {
        // Cache the products and categories
        localStorage.setItem('cachedProducts', JSON.stringify(response.productos));
        localStorage.setItem('cachedCategories', JSON.stringify(response.categorias));

        // Get first 6 products as favorites (you can modify this logic)
        this.favoriteProducts = response.productos.slice(0, 6);
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('❌ Error loading products (tab1):', error);
        console.error('🔍 Error details (tab1):', {
          status: error.status,
          statusText: error.statusText,
          url: apiUrl,
          message: error.message
        });

        this.isLoadingProducts = false;
        this.hasError = true;
        this.errorMessage = error.status ? `Error ${error.status}: ${error.statusText || 'Sin descripción'}` : `Error: ${error.message || 'Desconocido'}`;
        this.showToast('Error al cargar productos desde el servidor.', 'error');

        // Keep the placeholder products if API fails
        this.favoriteProducts = [];
      }
    });
  }

  retryLoadProducts() {
    this.loadFavoriteProducts();
  }

  addToCart(product: Product) {
    // Check if user is logged in
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.showToast('Debes iniciar sesión para agregar productos al carrito', 'warning');
      return;
    }

    // Add to backend cart
    const headers = { 'Authorization': `Bearer ${token}` };
    const cartData = { id_producto: product.id_producto };

    this.http.post(`${API_BASE_URL}/addCart`, cartData, { headers, withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.ok) {
          this.showToast('Producto agregado al carrito', 'success');

          // Emit cart update event for other tabs
          const cartEvent = new CustomEvent('cartUpdated');
          window.dispatchEvent(cartEvent);
        } else {
          this.showToast(response.mensaje || 'Error al agregar producto', 'error');
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.showToast('Error al agregar producto al carrito', 'error');
      }
    });
  }

  getProductIcon(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('tornillo')) return 'cube';
    if (name.includes('princesa') || name.includes('surtida')) return 'gift';
    if (name.includes('duquesa')) return 'restaurant';
    if (name.includes('esponja') || name.includes('natural')) return 'leaf';
    if (name.includes('figura')) return 'star';
    if (name.includes('menta') || name.includes('blanca')) return 'snow';
    return 'cube'; // default
  }

  getImageSrc(product: Product): string | null {
    // Return default image instead of processing base64
    return 'assets/img/costanzo.png';
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    console.warn('Image failed to load:', imgElement.src);
    // Hide the broken image
    imgElement.style.display = 'none';
  }

  getSlideBackground(index: number): string {
    // Return base64 image or default placeholder
    return this.slideImages[index] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUU2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRlZmF1bHQgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: `toast-${type}`
    });
    await toast.present();
  }
}
