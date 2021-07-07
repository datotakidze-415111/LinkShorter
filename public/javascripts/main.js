const burger = document.querySelector('.burger');
const closer = document.querySelector('.closer');
const navUl = document.querySelector('.nav-ul');


burger.addEventListener('click', () => {
    navUl.style.width = '300px';
});

closer.addEventListener('click', () => {
    navUl.style.width = '0px';
})