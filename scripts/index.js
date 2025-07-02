// Force dark theme and prevent automatic theme switching
document.documentElement.setAttribute('data-theme', 'dark');

// Override any theme switching based on device preference
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
        document.documentElement.setAttribute('data-theme', 'dark');
    });
}

// Simple carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-controls.prev');
    const nextBtn = document.querySelector('.carousel-controls.next');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Show first slide
    showSlide(0);
    
    // Auto-advance slides every 5 seconds
    setInterval(nextSlide, 5000);
});