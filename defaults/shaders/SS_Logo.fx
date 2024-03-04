uniform int Type <
        ui_type = "combo";
        ui_items = "SS_Logo\0";
> = 0;

#include "ReShade.fxh"
#define pixel float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT)

float2 circlePosition;
float2 circleVelocity;

void UpdateCirclePosition(float2 screenBounds)
{
    // Update circle position based on velocity
    circlePosition += circleVelocity * pixel;

    // Bounce off the walls
    if (circlePosition.x < 0 || circlePosition.x > 1)
        circleVelocity.x *= -1;

    if (circlePosition.y < 0 || circlePosition.y > 1)
        circleVelocity.y *= -1;
}

float3 PS_SS_Logo(float4 vpos : SV_Position, float2 texcoord : TexCoord) : SV_Target
{
    float2 center = circlePosition;
    float radius = 0.05; // Adjust the radius of the circle

    UpdateCirclePosition(float2(1, 1)); // Pass the screen bounds to the update function

    float distanceToCenter = length(texcoord - center);
    
    float3 output;

    // Check if the pixel is inside the circle
    if (distanceToCenter < radius)
    {
        // Inside the circle, set color to white
        output = float3(1, 1, 1);
    }
    else
    {
        // Outside the circle, set color to black
        output = float3(0, 0, 0);
    }

    return output;
}

technique Logo
{
    pass
    {
        VertexShader = PostProcessVS;
        PixelShader = PS_SS_Logo;
    }
}