(() => {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nav = document.getElementById('primary-nav')
    const toggle = document.querySelector('.menu-toggle')

    const setNavOpen = (open) => {
        if (!nav || !toggle) return
        nav.dataset.open = open ? 'true' : 'false'
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    }

    const isNavOpen = () => nav?.dataset.open === 'true'

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            setNavOpen(!isNavOpen())
        })

        document.addEventListener('click', (e) => {
            const target = e.target
            if (!(target instanceof Node)) return
            if (!isNavOpen()) return
            if (toggle.contains(target) || nav.contains(target)) return
            setNavOpen(false)
        })

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return
            if (!isNavOpen()) return
            setNavOpen(false)
            toggle.focus()
        })

        nav.addEventListener('click', (e) => {
            const target = e.target
            if (!(target instanceof HTMLElement)) return
            if (target.tagName.toLowerCase() !== 'a') return
            setNavOpen(false)
        })
    }

    const revealEls = Array.from(document.querySelectorAll('.reveal'))

    if (prefersReducedMotion) {
        for (const el of revealEls) el.classList.add('is-visible')
    } else if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    entry.target.classList.add('is-visible')
                    observer.unobserve(entry.target)
                }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
        )

        for (const el of revealEls) observer.observe(el)
    } else {
        for (const el of revealEls) el.classList.add('is-visible')
    }

    const initSlick = () => {
        const $ = window.jQuery
        if (!$ || typeof $.fn?.slick !== 'function') return
        const $slider = $('.my-car')
        if (!$slider.length) return

        const shouldAutoplay = !prefersReducedMotion

        $slider.slick({
            autoplay: shouldAutoplay,
            autoplaySpeed: 3200,
            speed: prefersReducedMotion ? 0 : 650,
            dots: true,
            arrows: true,
            pauseOnHover: true,
            pauseOnFocus: true,
            adaptiveHeight: false,
            customPaging: function (_slider, i) {
                return '<button type="button" aria-label="Go to slide ' + (i + 1) + '">' + (i + 1) + '</button>'
            },
        })
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlick)
    } else {
        initSlick()
    }

    const form = document.querySelector('[data-contact-form]')
    if (form instanceof HTMLFormElement) {
        const statusEl = form.querySelector('#form-status')
        const submitBtn = form.querySelector('button[type="submit"]')

        const fields = Array.from(form.querySelectorAll('.field-input')).filter(
            (el) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
        )

        const setStatus = (message) => {
            if (!(statusEl instanceof HTMLElement)) return
            statusEl.textContent = message
        }

        const validate = () => {
            let ok = true
            for (const el of fields) {
                const isValid = el.checkValidity()
                el.setAttribute('aria-invalid', isValid ? 'false' : 'true')
                ok = ok && isValid
            }
            return ok
        }

        form.addEventListener('input', (e) => {
            const target = e.target
            if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
            if (!target.classList.contains('field-input')) return
            const isValid = target.checkValidity()
            target.setAttribute('aria-invalid', isValid ? 'false' : 'true')
        })

        form.addEventListener('submit', (e) => {
            e.preventDefault()
            setStatus('')

            const ok = validate()
            if (!ok) {
                setStatus('Please check the highlighted fields.')
                const firstInvalid = fields.find((el) => !el.checkValidity())
                firstInvalid?.focus()
                return
            }

            if (submitBtn instanceof HTMLButtonElement) {
                submitBtn.disabled = true
            }

            setStatus('Sending…')

            window.setTimeout(
                () => {
                    setStatus('Message prepared (demo). Replace this with a real backend handler.')
                    form.reset()
                    for (const el of fields) el.setAttribute('aria-invalid', 'false')
                    if (submitBtn instanceof HTMLButtonElement) {
                        submitBtn.disabled = false
                    }
                },
                prefersReducedMotion ? 0 : 700
            )
        })
    }
})()
