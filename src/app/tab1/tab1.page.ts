import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cube, gift, restaurant, leaf, star, snow, cart } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

// Environment configuration
const API_BASE_URL = 'http://localhost:5050';

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_unitario: number;
  activo: number;
  imagen?: string;
  stock: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, CommonModule]
})
export class Tab1Page implements AfterViewInit, OnDestroy {
  private currentSlide = 0;
  private slideInterval: any;
  private slides: NodeListOf<Element> | null = null;
  private dots: NodeListOf<Element> | null = null;
  public favoriteProducts: Product[] = [];
  public slideImages: string[] = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUU2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNhZsOpcyAyWDE8L3RleHQ+Cjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNEREI3NjMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkR1bGNlcyBBcnRlc2FuYWxlczwvdGV4dD4KPC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUU2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NTQzMjEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1lbWJyZXNpYSBQcmVtaXVtPC90ZXh0Pgo8L3N2Zz4='
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
    addIcons({ cube, gift, restaurant, leaf, star, snow, cart });
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
    // Check if products are already cached
    const cachedProducts = localStorage.getItem('cachedProducts');
    const cachedCategories = localStorage.getItem('cachedCategories');

    if (cachedProducts && cachedCategories && cachedProducts !== 'undefined' && cachedCategories !== 'undefined') {
      try {
        const products = JSON.parse(cachedProducts);
        // Get first 6 products as favorites (you can modify this logic)
        this.favoriteProducts = products.slice(0, 6);
        console.log('Productos cargados desde cache:', this.favoriteProducts);
        return;
      } catch (error) {
        console.warn('Error parsing cached products, fetching from API:', error);
        // Clear invalid cache
        localStorage.removeItem('cachedProducts');
        localStorage.removeItem('cachedCategories');
        this.showToast('Error al cargar productos del caché, obteniendo datos del servidor...', 'warning');
      }
    }

    // Simular carga de productos para desarrollo
    setTimeout(() => {
      const mockResponse = {
        productos: [
          {
            id_producto: 1,
            nombre: 'Tornillo',
            descripcion: 'Delicioso chocolate macizo con leche',
            categoria: 'Chocolates',
            precio_unitario: 25.00,
            activo: 1,
            stock: 10,
            imagen: '/assets/img/02Tornillo.jpg'
          },
          {
            id_producto: 2,
            nombre: 'Princesa Surtida',
            descripcion: 'Bombón de chocolate amargo relleno de fondant y jalea',
            categoria: 'Bombones',
            precio_unitario: 30.00,
            activo: 1,
            stock: 15,
            imagen: '/assets/img/09PrincesaSurtida.jpg'
          },
          {
            id_producto: 3,
            nombre: 'Duquesa',
            descripcion: 'Irresistible sandwich de galleta con jalea y chocolate',
            categoria: 'Galletas',
            precio_unitario: 28.00,
            activo: 1,
            stock: 8,
            imagen: '/assets/img/DUQUESA-PRESENTACIONES.jpg'
          },
          {
            id_producto: 4,
            nombre: 'Esponja Natural',
            descripcion: 'Chocolate blanco con menta fresca',
            categoria: 'Especiales',
            precio_unitario: 35.00,
            activo: 1,
            stock: 5,
            imagen: '/assets/img/Esponja-Natural.jpg'
          },
          {
            id_producto: 5,
            nombre: 'Figura de Chocolate',
            descripcion: 'Figuras decorativas de chocolate premium',
            categoria: 'Decoraciones',
            precio_unitario: 45.00,
            activo: 1,
            stock: 3,
            imagen: '/assets/img/figura.png'
          },
          {
            id_producto: 6,
            nombre: 'Menta Blanca',
            descripcion: 'Chocolate blanco con menta refrescante',
            categoria: 'Especiales',
            precio_unitario: 32.00,
            activo: 1,
            stock: 12,
            imagen: '/assets/img/Menta-Blanca.jpg'
          }
        ],
        categorias: ['Chocolates', 'Bombones', 'Galletas', 'Especiales', 'Decoraciones']
      };

      // Cache the products and categories
      localStorage.setItem('cachedProducts', JSON.stringify(mockResponse.productos));
      localStorage.setItem('cachedCategories', JSON.stringify(mockResponse.categorias));

      // Get first 6 products as favorites (you can modify this logic)
      this.favoriteProducts = mockResponse.productos.slice(0, 6);
      console.log('Productos simulados cargados:', this.favoriteProducts);
    }, 800); // Simular delay de 800ms

    // Código comentado para cuando tengas el backend listo:
    /*
    // Replace with your actual backend URL - check if your Flask server is running
    const apiUrl = `${API_BASE_URL}/getProducts`; // Adjust this to your Flask server URL

    this.http.get<{productos: Product[], categorias: string[]}>(apiUrl).subscribe({
      next: (response) => {
        // Cache the products and categories
        localStorage.setItem('cachedProducts', JSON.stringify(response.productos));
        localStorage.setItem('cachedCategories', JSON.stringify(response.categorias));

        // Get first 6 products as favorites (you can modify this logic)
        this.favoriteProducts = response.productos.slice(0, 6);
        console.log('Productos cargados desde API:', this.favoriteProducts);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showToast('Error al cargar productos desde el servidor. Mostrando datos de respaldo.', 'error');
        // Keep the placeholder products if API fails
        this.favoriteProducts = [];
        // For now, let's add some mock data so you can see the layout working
        this.favoriteProducts = [
          {
            id_producto: 1,
            nombre: 'Tornillo',
            descripcion: 'Delicioso chocolate macizo con leche',
            categoria: 'Chocolates',
            precio_unitario: 25.00,
            activo: 1,
            stock: 10
          },
          {
            id_producto: 2,
            nombre: 'Princesa Surtida',
            descripcion: 'Bombón de chocolate amargo relleno de fondant y jalea',
            categoria: 'Bombones',
            precio_unitario: 30.00,
            activo: 1,
            stock: 15
          },
          {
            id_producto: 3,
            nombre: 'Duquesa',
            descripcion: 'Irresistible sandwich de galleta con jalea y chocolate',
            categoria: 'Galletas',
            precio_unitario: 28.00,
            activo: 1,
            stock: 8
          }
        ];
      }
    });
    */
  }

  addToCart(product: Product) {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', product);
    // You can implement cart logic here later
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
