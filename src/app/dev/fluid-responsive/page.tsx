import React from 'react';
import FluidLayout, { 
  Header, 
  Main, 
  Sidebar, 
  Footer, 
  Card, 
  Section, 
  Panel 
} from '@/components/layout/FluidLayout';
import ResponsiveText from '@/components/ui/ResponsiveText';
import ContainerQueryCard from '@/components/ui/ContainerQueryCard';
import '@/styles/fluid-responsive.css';

/**
 * Fluid Responsive Demo Page
 * 
 * This page demonstrates the fluid responsive layout system including:
 * - CSS Grid layouts
 * - Flexbox components
 * - Responsive typography
 * - Container queries
 * 
 * This implementation showcases the power of fluid responsive design,
 * allowing the UI to adapt smoothly across different viewport sizes
 * and container dimensions.
 */
export default function FluidResponsivePage() {
  return (
    <div className="fluid-responsive-demo">
      <ResponsiveText as="h1" variant="fluid3xl" className="mb-8">
        Fluid Responsive Layout Demo
      </ResponsiveText>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          1. Responsive Typography
        </ResponsiveText>
        
        <div className="space-y-4">
          <ResponsiveText as="h1" variant="h1">Heading 1</ResponsiveText>
          <ResponsiveText as="h2" variant="h2">Heading 2</ResponsiveText>
          <ResponsiveText as="h3" variant="h3">Heading 3</ResponsiveText>
          <ResponsiveText as="h4" variant="h4">Heading 4</ResponsiveText>
          <ResponsiveText as="h5" variant="h5">Heading 5</ResponsiveText>
          <ResponsiveText as="h6" variant="h6">Heading 6</ResponsiveText>
          <ResponsiveText as="p" variant="bodyLarge">Body Large Text</ResponsiveText>
          <ResponsiveText as="p" variant="bodyBase">Body Base Text</ResponsiveText>
          <ResponsiveText as="p" variant="bodySmall">Body Small Text</ResponsiveText>
          <ResponsiveText as="div" variant="displaySmall">Display Small</ResponsiveText>
          
          <div className="mt-8">
            <ResponsiveText as="h3" variant="h3" className="mb-2">Fluid Typography</ResponsiveText>
            <ResponsiveText as="p" variant="fluidXs">Fluid XS Text</ResponsiveText>
            <ResponsiveText as="p" variant="fluidSm">Fluid SM Text</ResponsiveText>
            <ResponsiveText as="p" variant="fluidBase">Fluid Base Text</ResponsiveText>
            <ResponsiveText as="p" variant="fluidLg">Fluid LG Text</ResponsiveText>
            <ResponsiveText as="p" variant="fluidXl">Fluid XL Text</ResponsiveText>
            <ResponsiveText as="p" variant="fluid2xl">Fluid 2XL Text</ResponsiveText>
            <ResponsiveText as="p" variant="fluid3xl">Fluid 3XL Text</ResponsiveText>
          </div>
          
          <div className="mt-8">
            <ResponsiveText as="h3" variant="h3" className="mb-2">Custom Typography</ResponsiveText>
            <ResponsiveText as="p" variant="bodyBase" weight="bold">Bold Text</ResponsiveText>
            <ResponsiveText as="p" variant="bodyBase" lineHeight="tight">Tight Line Height</ResponsiveText>
            <ResponsiveText as="p" variant="bodyBase" letterSpacing="wide">Wide Letter Spacing</ResponsiveText>
            <ResponsiveText 
              as="p" 
              variant="bodyBase" 
              weight="semibold" 
              lineHeight="loose" 
              letterSpacing="wider"
            >
              Combined Custom Styles
            </ResponsiveText>
          </div>
        </div>
      </Section>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          2. CSS Grid Layout
        </ResponsiveText>
        
        <FluidLayout>
          <Header>
            <div className="bg-blue-100 p-4 rounded">Header Area</div>
          </Header>
          
          <Sidebar>
            <div className="bg-green-100 p-4 rounded">Sidebar Area</div>
          </Sidebar>
          
          <Main>
            <div className="bg-purple-100 p-4 rounded">
              <p>Main Content Area</p>
              <p>This area will grow and shrink based on the viewport size.</p>
            </div>
          </Main>
          
          <Footer>
            <div className="bg-gray-100 p-4 rounded">Footer Area</div>
          </Footer>
        </FluidLayout>
        
        <div className="mt-8">
          <ResponsiveText as="h3" variant="h3" className="mb-4">Grid Column Spans</ResponsiveText>
          
          <div className="fluid-grid-12">
            <div className="col-span-12 md\\:col-span-6 lg\\:col-span-4 bg-blue-100 p-4 rounded">
              <p>Responsive Column</p>
              <p>12 cols on mobile, 6 on tablet, 4 on desktop</p>
            </div>
            
            <div className="col-span-12 md\\:col-span-6 lg\\:col-span-4 bg-green-100 p-4 rounded">
              <p>Responsive Column</p>
              <p>12 cols on mobile, 6 on tablet, 4 on desktop</p>
            </div>
            
            <div className="col-span-12 lg\\:col-span-4 bg-purple-100 p-4 rounded">
              <p>Responsive Column</p>
              <p>12 cols on mobile, 12 on tablet, 4 on desktop</p>
            </div>
          </div>
        </div>
      </Section>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          3. Fluid Grid
        </ResponsiveText>
        
        <div className="fluid-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-yellow-100 p-4 rounded">
              <ResponsiveText as="h3" variant="h4">Card {item}</ResponsiveText>
              <ResponsiveText as="p" variant="bodyBase">
                This card is part of a fluid grid that adapts to the available space.
              </ResponsiveText>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <ResponsiveText as="h3" variant="h3" className="mb-4">Fluid Grid with Columns</ResponsiveText>
          
          <div className="fluid-grid-cols">
            <div className="bg-blue-100 p-4 rounded">
              <p>Auto-adjusting column</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <p>Auto-adjusting column</p>
            </div>
            <div className="bg-purple-100 p-4 rounded">
              <p>Auto-adjusting column</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded">
              <p>Auto-adjusting column</p>
            </div>
          </div>
        </div>
      </Section>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          4. Container Queries
        </ResponsiveText>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="w-full">
            <ResponsiveText as="h3" variant="h5" className="mb-2">Small Container</ResponsiveText>
            <ContainerQueryCard 
              title="Small Card" 
              containerName="small-card"
              image="/placeholder.jpg"
              headerActions={<button className="px-2 py-1 bg-blue-500 text-white rounded text-sm">Action</button>}
            >
              <p>This card adapts based on its container width, not the viewport.</p>
              <p className="mt-2">Container queries enable truly responsive components.</p>
            </ContainerQueryCard>
          </div>
          
          <div className="w-full md:col-span-2">
            <ResponsiveText as="h3" variant="h5" className="mb-2">Medium Container</ResponsiveText>
            <ContainerQueryCard 
              title="Medium Card" 
              containerName="medium-card"
              variant="expanded"
              image="/placeholder.jpg"
              footerActions={
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded">Primary</button>
                  <button className="px-3 py-1 border border-gray-300 rounded">Secondary</button>
                </div>
              }
            >
              <p>This card has more space, so it adapts its layout accordingly.</p>
              <p className="mt-2">Notice how the image and text arrangement changes based on width.</p>
            </ContainerQueryCard>
          </div>
          
          <div className="w-full lg:col-span-3">
            <ResponsiveText as="h3" variant="h5" className="mb-2">Large Container</ResponsiveText>
            <ContainerQueryCard 
              title="Large Card" 
              containerName="large-card"
              variant="default"
              headerActions={
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-green-500 text-white rounded text-sm">Approve</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded text-sm">Reject</button>
                </div>
              }
            >
              <p>This card spans the full width, demonstrating another layout variation.</p>
              <p className="mt-2">Container queries allow components to adapt to their container's size rather than the viewport size.</p>
              <p className="mt-2">This enables truly reusable components that work in any context.</p>
            </ContainerQueryCard>
          </div>
        </div>
        
        <div className="mt-8">
          <ResponsiveText as="h3" variant="h3" className="mb-4">Container Query Text</ResponsiveText>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card containerName="small-text-container">
              <ResponsiveText 
                as="h4" 
                containerQuery={true} 
                containerSize="small" 
                containerType="heading"
              >
                Small Container Heading
              </ResponsiveText>
              <ResponsiveText 
                as="p" 
                containerQuery={true} 
                containerSize="small" 
                containerType="body"
                className="mt-2"
              >
                This text adapts based on its container size. The font size is determined by container queries.
              </ResponsiveText>
            </Card>
            
            <Card containerName="medium-text-container">
              <ResponsiveText 
                as="h4" 
                containerQuery={true} 
                containerSize="medium" 
                containerType="heading"
              >
                Medium Container Heading
              </ResponsiveText>
              <ResponsiveText 
                as="p" 
                containerQuery={true} 
                containerSize="medium" 
                containerType="body"
                className="mt-2"
              >
                This text adapts based on its container size. The font size is determined by container queries.
              </ResponsiveText>
            </Card>
            
            <Card containerName="large-text-container">
              <ResponsiveText 
                as="h4" 
                containerQuery={true} 
                containerSize="large" 
                containerType="heading"
              >
                Large Container Heading
              </ResponsiveText>
              <ResponsiveText 
                as="p" 
                containerQuery={true} 
                containerSize="large" 
                containerType="body"
                className="mt-2"
              >
                This text adapts based on its container size. The font size is determined by container queries.
              </ResponsiveText>
            </Card>
          </div>
        </div>
      </Section>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          5. Flexbox Layouts
        </ResponsiveText>
        
        <div className="space-y-8">
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Row Layout</ResponsiveText>
            <div className="flex-row">
              <div className="bg-red-100 p-4 rounded">Item 1</div>
              <div className="bg-red-100 p-4 rounded">Item 2</div>
              <div className="bg-red-100 p-4 rounded">Item 3</div>
            </div>
          </div>
          
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Column Layout</ResponsiveText>
            <div className="flex-column">
              <div className="bg-blue-100 p-4 rounded">Item 1</div>
              <div className="bg-blue-100 p-4 rounded">Item 2</div>
              <div className="bg-blue-100 p-4 rounded">Item 3</div>
            </div>
          </div>
          
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Responsive Flex Direction</ResponsiveText>
            <div className="flex-column md\\:flex-row items-center justify-between fluid-gap">
              <div className="bg-green-100 p-4 rounded flex-basis-100 md\\:flex-basis-25">Item 1</div>
              <div className="bg-green-100 p-4 rounded flex-basis-100 md\\:flex-basis-25">Item 2</div>
              <div className="bg-green-100 p-4 rounded flex-basis-100 md\\:flex-basis-25">Item 3</div>
            </div>
          </div>
          
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Flex Alignment</ResponsiveText>
            <div className="flex-row justify-between items-center" style={{ height: '100px', backgroundColor: '#f0f9ff' }}>
              <div className="bg-purple-100 p-4 rounded">Left</div>
              <div className="bg-purple-100 p-4 rounded">Center</div>
              <div className="bg-purple-100 p-4 rounded">Right</div>
            </div>
          </div>
        </div>
      </Section>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          6. Responsive Visibility
        </ResponsiveText>
        
        <div className="space-y-8">
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Hide on Breakpoints</ResponsiveText>
            <div className="bg-red-100 p-4 rounded hide-on-mobile">
              Hidden on Mobile (resize to see)
            </div>
            <div className="bg-green-100 p-4 rounded mt-4 hide-on-tablet">
              Hidden on Tablet (resize to see)
            </div>
            <div className="bg-blue-100 p-4 rounded mt-4 hide-on-desktop">
              Hidden on Desktop (resize to see)
            </div>
          </div>
          
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Show on Breakpoints</ResponsiveText>
            <div className="bg-yellow-100 p-4 rounded show-on-mobile">
              Visible only on Mobile (resize to see)
            </div>
            <div className="bg-orange-100 p-4 rounded mt-4 show-on-tablet">
              Visible only on Tablet (resize to see)
            </div>
            <div className="bg-purple-100 p-4 rounded mt-4 show-on-desktop">
              Visible only on Desktop (resize to see)
            </div>
          </div>
        </div>
      </Section>
      
      <Section>
        <ResponsiveText as="h2" variant="fluid2xl" className="mb-4">
          7. Fluid Spacing
        </ResponsiveText>
        
        <div className="space-y-8">
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Padding Variants</ResponsiveText>
            <div className="flex-row">
              <div className="bg-red-100 fluid-p-xs">XS Padding</div>
              <div className="bg-orange-100 fluid-p-sm">SM Padding</div>
              <div className="bg-yellow-100 fluid-p-md">MD Padding</div>
              <div className="bg-green-100 fluid-p-lg">LG Padding</div>
              <div className="bg-blue-100 fluid-p-xl">XL Padding</div>
            </div>
          </div>
          
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Margin Variants</ResponsiveText>
            <div className="bg-purple-100 p-2">Base Element</div>
            <div className="bg-red-100 p-2 fluid-mt">Top Margin</div>
            <div className="flex-row">
              <div className="bg-green-100 p-2">No Margin</div>
              <div className="bg-blue-100 p-2 fluid-mx">Horizontal Margin</div>
              <div className="bg-yellow-100 p-2">No Margin</div>
            </div>
          </div>
          
          <div>
            <ResponsiveText as="h3" variant="h4" className="mb-2">Gap Variants</ResponsiveText>
            <div className="flex-row fluid-gap-xs">
              <div className="bg-red-100 p-2">XS Gap</div>
              <div className="bg-red-100 p-2">XS Gap</div>
              <div className="bg-red-100 p-2">XS Gap</div>
            </div>
            <div className="flex-row fluid-gap-md mt-4">
              <div className="bg-green-100 p-2">MD Gap</div>
              <div className="bg-green-100 p-2">MD Gap</div>
              <div className="bg-green-100 p-2">MD Gap</div>
            </div>
            <div className="flex-row fluid-gap-xl mt-4">
              <div className="bg-blue-100 p-2">XL Gap</div>
              <div className="bg-blue-100 p-2">XL Gap</div>
              <div className="bg-blue-100 p-2">XL Gap</div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}