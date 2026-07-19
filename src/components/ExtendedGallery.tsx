import { Bell, CalendarDays, Filter, Inbox, Settings2, Trash2, UserPlus } from "lucide-react"
import { Accordion } from "./ui/accordion"
import { Alert } from "./ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb"
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { EmptyState } from "./ui/empty-state"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Progress } from "./ui/progress"
import { Skeleton, SkeletonCard } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Tooltip } from "./ui/tooltip"
import "../extended-components.css"

function GallerySection({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <section id={id} className="spec-section"><div className="section-heading"><p className="eyebrow">{label}</p><h2>{label}</h2></div>{children}</section>
}

function GallerySpecimen({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="specimen"><div className="specimen-bar"><span>{title}</span><span>Interactive</span></div><div className="specimen-content">{children}</div></div>
}

export function ExtendedGallery() {
  return <>
    <GallerySection id="navigation" label="Navigation">
      <div className="extended-stack">
        <GallerySpecimen title="Breadcrumb & tabs">
          <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#top">Library</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbLink href="#navigation">Components</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbPage>Navigation</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          <Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList><TabsContent value="overview"><p>Overview content keeps the most important information first.</p></TabsContent><TabsContent value="activity"><p>Recent component and token updates appear here.</p></TabsContent><TabsContent value="settings"><p>Workspace preferences and access controls.</p></TabsContent></Tabs>
        </GallerySpecimen>
        <div className="two-col">
          <GallerySpecimen title="Pagination"><Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#navigation" /></PaginationItem><PaginationItem><PaginationLink href="#navigation">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#navigation" isActive>2</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#navigation">3</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationNext href="#navigation" /></PaginationItem></PaginationContent></Pagination></GallerySpecimen>
          <GallerySpecimen title="Avatars"><div className="avatar-row"><Avatar><AvatarFallback>OF</AvatarFallback></Avatar><Avatar><AvatarFallback>AK</AvatarFallback></Avatar><Avatar><AvatarFallback>JL</AvatarFallback></Avatar><span className="avatar-copy"><b>Project team</b><small>3 collaborators online</small></span></div></GallerySpecimen>
        </div>
      </div>
    </GallerySection>

    <GallerySection id="overlays" label="Overlays">
      <div className="overlay-demo-grid">
        <GallerySpecimen title="Dialog">
          <Dialog><DialogTrigger className="button button-outline button-default">Edit profile</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Make changes to your public profile details.</DialogDescription></DialogHeader><label className="dialog-field">Display name<input defaultValue="Owen Fisher" /></label><DialogFooter><DialogClose className="button button-outline button-default">Cancel</DialogClose><DialogClose className="button button-default">Save changes</DialogClose></DialogFooter></DialogContent></Dialog>
        </GallerySpecimen>
        <GallerySpecimen title="Alert dialog">
          <AlertDialog><AlertDialogTrigger className="button button-destructive button-default"><Trash2 size={15}/> Delete project</AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this project?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All component settings will be removed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete project</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </GallerySpecimen>
        <GallerySpecimen title="Popover & tooltip">
          <div className="row wrap"><Popover><PopoverTrigger className="button button-outline button-default"><Filter size={15}/> Filters</PopoverTrigger><PopoverContent aria-label="Filter projects"><strong>Filter projects</strong><label className="popover-check"><input type="checkbox" defaultChecked/> Active projects</label><label className="popover-check"><input type="checkbox"/> Archived projects</label></PopoverContent></Popover><Tooltip content="Notification preferences" side="top"><button className="button button-ghost button-default" aria-label="Notification preferences"><Bell size={17}/></button></Tooltip></div>
        </GallerySpecimen>
      </div>
    </GallerySection>

    <GallerySection id="states" label="States & feedback">
      <div className="extended-stack">
        <div className="two-col">
          <GallerySpecimen title="Accordion"><Accordion defaultOpen={["item-1"]} items={[{id:"item-1",title:"Is this reusable?",content:"Yes. Every primitive lives in its own source file and shares semantic tokens."},{id:"item-2",title:"Does it support dark mode?",content:"The palette generator creates matching light and dark themes."},{id:"item-3",title:"Can I copy the CSS?",content:"Use Customize → Copy CSS to export the current variables."}]}/></GallerySpecimen>
          <GallerySpecimen title="Progress"><div className="progress-stack"><Progress label="Profile setup" value={72} showValue/><Progress label="Uploading assets"/><Progress label="Storage used" value={38} showValue/></div></GallerySpecimen>
        </div>
        <GallerySpecimen title="Alerts"><div className="alert-stack"><Alert variant="info" title="New component available" description="The command palette is ready to add." action={<Button variant="ghost" size="sm">View</Button>}/><Alert variant="success" title="Theme saved" description="Your custom tokens are stored locally."/><Alert variant="warning" title="Contrast needs attention" description="Muted text is below AA on the selected surface."/><Alert variant="destructive" title="Build failed" description="Fix the missing export and try again."/></div></GallerySpecimen>
        <div className="two-col">
          <GallerySpecimen title="Empty state"><EmptyState icon={<Inbox size={25}/>} title="No components found" description="Try another filter or add your first custom component." action={<Button size="sm"><UserPlus size={15}/> Add component</Button>}/></GallerySpecimen>
          <GallerySpecimen title="Skeletons"><div className="skeleton-demo"><SkeletonCard/><div className="skeleton-list"><Skeleton shape="circle"/><div><Skeleton shape="text"/><Skeleton shape="text"/></div></div></div></GallerySpecimen>
        </div>
      </div>
    </GallerySection>
  </>
}
