import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cube, gift, restaurant, leaf, star, snow, cart, addCircle } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';

// Environment configuration
const API_BASE_URL = 'https://backend-app-x7k2.zeabur.app/'; // Force HTTPS production URL for testing
// const API_BASE_URL = environment.apiUrl; // Original environment-based URL

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
  imagen_base64?: string;
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
  public lastUpdateTime: string = 'Nunca';
  public connectionStatus: string = 'Verificando conexión...';
  public connectionStatusColor: string = '#ffa500'; // Orange
  public isLoading: boolean = false;
  public hasConnectionError: boolean = false;

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

  getStatusBackground(): string {
    if (this.isLoading) {
      return '#e3f2fd'; // Light blue
    } else if (this.hasConnectionError) {
      return '#ffebee'; // Light red
    } else {
      return '#e8f5e8'; // Light green
    }
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
        this.connectionStatus = '✅ Datos cargados desde caché';
        this.connectionStatusColor = '#28a745';
        this.hasConnectionError = false;
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
    this.isLoading = true;
    this.hasConnectionError = false;
    const apiUrl = `${API_BASE_URL}/getProducts`;
    console.log('🌐 API URL being used:', apiUrl);
    console.log('🔧 Environment API URL:', API_BASE_URL);

    // Test basic connectivity first
    console.log('🔍 Testing basic connectivity to server...');
    this.connectionStatus = '🔍 Probando conexión...';
    this.connectionStatusColor = '#17a2b8'; // Blue

    this.http.get<{productos: Product[], categorias: string[]}>(apiUrl).subscribe({
      next: (response) => {
        console.log('✅ Respuesta completa de la API:', response);
        console.log('📦 Productos recibidos:', response.productos?.length || 0);
        console.log('🏷️ Categorías recibidas:', response.categorias?.length || 0);
        this.isLoading = false;
        this.hasConnectionError = false;
        this.connectionStatus = '✅ Conectado - Datos cargados';
        this.connectionStatusColor = '#28a745'; // Green
        this.allProducts = response.productos;
        this.categories = response.categorias;

        // Cache the products and categories
        localStorage.setItem('cachedProducts', JSON.stringify(response.productos));
        localStorage.setItem('cachedCategories', JSON.stringify(response.categorias));

        this.applyFilters();
        this.checkForMoreProducts();
        this.updateLastUpdateTime();
      },
      error: (error: any) => {
        console.error('❌ Error loading products:', error);
        console.error('🔍 Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: apiUrl,
          message: error.message,
          name: error.name,
          type: typeof error
        });

        this.isLoading = false;
        this.hasConnectionError = true;

        let errorMessage = 'Error desconocido';
        if (error.status) {
          errorMessage = `Error ${error.status}: ${error.statusText || 'Sin descripción'}`;
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        } else if (error.name) {
          errorMessage = `Error ${error.name}`;
        }

        this.connectionStatus = errorMessage;
        this.connectionStatusColor = '#dc3545'; // Red
        this.showToast('Error al cargar productos desde el servidor. Mostrando datos de respaldo.', 'error');
        // Show fallback data with error indication
        console.log('⚠️ Using fallback data due to connection error');
        this.isLoading = false;
        this.hasConnectionError = true;
        this.connectionStatus = 'Usando datos locales (sin conexión)';
        this.connectionStatusColor = '#ffc107'; // Yellow

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
        this.updateLastUpdateTime();
      }
    });
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
          // Update local cart for immediate UI feedback
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

          // Emit cart update event for other tabs
          const cartEvent = new CustomEvent('cartUpdated');
          window.dispatchEvent(cartEvent);

          this.showToast('Producto agregado al carrito', 'success');
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
    // console.log('Proceeding to checkout with items:', this.cartItems);
    alert('Funcionalidad de checkout próximamente disponible');
  }

  retryConnection() {
    console.log('🔄 Retrying connection...');
    this.loadProducts();
  }

  private updateLastUpdateTime() {
    const now = new Date();
    this.lastUpdateTime = now.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    console.log('📅 Last update time:', this.lastUpdateTime);
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
