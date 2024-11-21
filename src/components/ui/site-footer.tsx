export function SiteFooter() {
    return (
        <footer className="
        sticky 
        top-full
        z-40 
        border-t 
        border-border/40 
        bg-background/95 
        backdrop-blur 
        supports-[backdrop-filter]:bg-background/60 
        dark:border-border
        text-center
        ">
            <p className='text-sm font-semibold text-muted-foreground'>
                sisältää Maanmittauslaitoksen Maastotietokannan Korkeusmalli 2m aineistoa
            </p>
        </footer>
    )
}