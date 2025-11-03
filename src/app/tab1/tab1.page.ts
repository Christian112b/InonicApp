import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cube, gift, restaurant, leaf, star, snow, cart } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_unitario: number;
  activo: number;
  imagen_base64?: string;
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

  constructor(private http: HttpClient) {
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
    // Replace with your actual backend URL - check if your Flask server is running
    const apiUrl = 'http://localhost:5000/getProducts'; // Adjust this to your Flask server URL

    this.http.get<{productos: Product[], categorias: string[]}>(apiUrl).subscribe({
      next: (response) => {
        // Get first 6 products as favorites (you can modify this logic)
        this.favoriteProducts = response.productos.slice(0, 6);
        console.log('Productos cargados desde API:', this.favoriteProducts);
      },
      error: (error) => {
        console.error('Error loading products:', error);
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
}
