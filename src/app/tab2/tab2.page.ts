import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cube, gift, restaurant, leaf, star, snow, cart, addCircle } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

// Environment configuration
const API_BASE_URL = 'http://localhost:5050';

interface CartItem {
  id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen?: string;
}

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
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, CommonModule]
})
export class Tab2Page implements OnInit {
  public allProducts: Product[] = [];
  public filteredProducts: Product[] = [];
  public categories: string[] = [];
  public currentFilter: string = 'todos';
  public searchTerm: string = '';
  public productsPerPage: number = 1000; // Show all products
  public currentPage: number = 1;
  public hasMoreProducts: boolean = false;

  // Cart functionality
  public cartItems: CartItem[] = [];
  public cartTotal: number = 0;
  public cartItemCount: number = 0;
  public showCartModal: boolean = false;

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ cube, gift, restaurant, leaf, star, snow, cart, addCircle });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCartFromStorage();

    // Listen for cart modal open events from tab bar
    window.addEventListener('openCartModal', () => {
      this.openCartModal();
    });
  }

  private loadProducts() {
    // Check if products are already cached
    const cachedProducts = localStorage.getItem('cachedProducts');
    const cachedCategories = localStorage.getItem('cachedCategories');

    if (cachedProducts && cachedCategories && cachedProducts !== 'undefined' && cachedCategories !== 'undefined') {
      try {
        this.allProducts = JSON.parse(cachedProducts);
        this.categories = JSON.parse(cachedCategories);
        this.applyFilters();
        this.checkForMoreProducts();
        console.log('Productos cargados desde cache:', this.allProducts);
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
            categoria: 'Chocolate',
            precio_unitario: 25.00,
            activo: 1,
            stock: 10,
            imagen: '/assets/img/02Tornillo.jpg'
          },
          {
            id_producto: 2,
            nombre: 'Princesa Surtida',
            descripcion: 'Bombón de chocolate amargo relleno de fondant y jalea',
            categoria: 'Bombon',
            precio_unitario: 30.00,
            activo: 1,
            stock: 15,
            imagen: '/assets/img/09PrincesaSurtida.jpg'
          },
          {
            id_producto: 3,
            nombre: 'Duquesa',
            descripcion: 'Irresistible sandwich de galleta con jalea y chocolate',
            categoria: 'Sandwich',
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
          },
          {
            id_producto: 7,
            nombre: 'Bombón Premium',
            descripcion: 'Selección especial de bombones artesanales',
            categoria: 'Bombon',
            precio_unitario: 40.00,
            activo: 1,
            stock: 7,
            imagen: '/assets/img/09PrincesaSurtida.jpg'
          },
          {
            id_producto: 8,
            nombre: 'Galleta de Chocolate',
            descripcion: 'Galletas crujientes con chips de chocolate',
            categoria: 'Sandwich',
            precio_unitario: 22.00,
            activo: 1,
            stock: 20,
            imagen: '/assets/img/DUQUESA-PRESENTACIONES.jpg'
          }
        ],
        categorias: ['Chocolate', 'Bombon', 'Sandwich', 'Especiales', 'Decoraciones']
      };

      this.allProducts = mockResponse.productos;
      this.categories = mockResponse.categorias;

      // Cache the products and categories
      localStorage.setItem('cachedProducts', JSON.stringify(mockResponse.productos));
      localStorage.setItem('cachedCategories', JSON.stringify(mockResponse.categorias));

      this.applyFilters();
      this.checkForMoreProducts();
      console.log('Productos simulados cargados:', this.allProducts);
    }, 1000); // Simular delay de 1 segundo

    // Código comentado para cuando tengas el backend listo:
    /*
    const apiUrl = `${API_BASE_URL}/getProducts`;

    this.http.get<{productos: Product[], categorias: string[]}>(apiUrl).subscribe({
      next: (response) => {
        this.allProducts = response.productos;
        this.categories = response.categorias;

        // Cache the products and categories
        localStorage.setItem('cachedProducts', JSON.stringify(response.productos));
        localStorage.setItem('cachedCategories', JSON.stringify(response.categorias));

        this.applyFilters();
        this.checkForMoreProducts();
        console.log('Productos cargados desde API:', this.allProducts);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showToast('Error al cargar productos desde el servidor. Mostrando datos de respaldo.', 'error');
        // Mock data for development
        this.allProducts = [
          {
            id_producto: 1,
            nombre: 'Tornillo',
            descripcion: 'Delicioso chocolate macizo con leche',
            categoria: 'Chocolate',
            precio_unitario: 25.00,
            activo: 1,
            stock: 10
          },
          {
            id_producto: 2,
            nombre: 'Princesa Surtida',
            descripcion: 'Bombón de chocolate amargo relleno de fondant y jalea',
            categoria: 'Bombon',
            precio_unitario: 30.00,
            activo: 1,
            stock: 15
          },
          {
            id_producto: 3,
            nombre: 'Duquesa',
            descripcion: 'Irresistible sandwich de galleta con jalea y chocolate',
            categoria: 'Sandwich',
            precio_unitario: 28.00,
            activo: 1,
            stock: 8
          }
        ];
        this.categories = ['Chocolate', 'Bombon', 'Sandwich'];
        this.applyFilters();
        this.checkForMoreProducts();
      }
    });
    */
  }

  filterProducts(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    // Update active button styling
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.allProducts;

    // Apply category filter
    if (this.currentFilter !== 'todos') {
      filtered = filtered.filter(product => product.categoria === this.currentFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(this.searchTerm) ||
        product.descripcion.toLowerCase().includes(this.searchTerm)
      );
    }

    // Apply pagination
    const startIndex = 0;
    const endIndex = this.currentPage * this.productsPerPage;
    this.filteredProducts = filtered.slice(startIndex, endIndex);

    this.checkForMoreProducts();
  }

  private checkForMoreProducts() {
    const totalFiltered = this.allProducts.filter(product => {
      const matchesCategory = this.currentFilter === 'todos' || product.categoria === this.currentFilter;
      const matchesSearch = !this.searchTerm ||
        product.nombre.toLowerCase().includes(this.searchTerm) ||
        product.descripcion.toLowerCase().includes(this.searchTerm);
      return matchesCategory && matchesSearch;
    });

    this.hasMoreProducts = totalFiltered.length > (this.currentPage * this.productsPerPage);
  }

  loadMoreProducts() {
    this.currentPage++;
    this.applyFilters();
  }

  getProductIcon(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('tornillo')) return 'cube';
    if (name.includes('princesa') || name.includes('surtida')) return 'gift';
    if (name.includes('duquesa')) return 'restaurant';
    if (name.includes('esponja') || name.includes('natural')) return 'leaf';
    if (name.includes('figura')) return 'star';
    if (name.includes('menta') || name.includes('blanca')) return 'snow';
    return 'cube';
  }

  // Cart functionality
  addToCart(product: Product) {
    const existingItem = this.cartItems.find(item => item.id === product.id_producto);

    if (existingItem) {
      existingItem.cantidad++;
    } else {
      this.cartItems.push({
        id: product.id_producto,
        nombre: product.nombre,
        precio_unitario: product.precio_unitario,
        cantidad: 1,
        imagen: product.imagen
      });
    }

    this.updateCartTotals();
    this.saveCartToStorage();
    console.log('Added to cart:', product.nombre);
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.updateCartTotals();
    this.saveCartToStorage();
  }

  updateCartItemQuantity(productId: number, quantity: number) {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      item.cantidad = Math.max(0, quantity);
      if (item.cantidad === 0) {
        this.removeFromCart(productId);
      } else {
        this.updateCartTotals();
        this.saveCartToStorage();
      }
    }
  }

  updateCartTotals() {
    this.cartTotal = this.cartItems.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
    this.cartItemCount = this.cartItems.reduce((count, item) => count + item.cantidad, 0);
  }

  saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  loadCartFromStorage() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCartTotals();
    }
  }

  clearCart() {
    this.cartItems = [];
    this.updateCartTotals();
    this.saveCartToStorage();
  }

  openCartModal() {
    this.showCartModal = true;
  }

  closeCartModal() {
    this.showCartModal = false;
  }

  proceedToCheckout() {
    // TODO: Implement checkout process
    console.log('Proceeding to checkout with items:', this.cartItems);
    alert('Funcionalidad de checkout próximamente disponible');
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
