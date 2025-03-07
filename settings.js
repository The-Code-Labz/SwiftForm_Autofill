document.addEventListener('DOMContentLoaded', function() {
  const categories = document.querySelectorAll('.categories li');

  categories.forEach(category => {
    category.addEventListener('click', function() {
      // Remove active class from other categories
      categories.forEach(cat => cat.classList.remove('active'));

      // Add active class to clicked category
      this.classList.add('active');

      // Perform actions based on selected category (e.g., display items)
      const categoryName = this.dataset.category;
      console.log('Selected category:', categoryName);
    });
  });
});
