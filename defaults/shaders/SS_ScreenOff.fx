uniform int Type <
        ui_type = "combo";
        ui_items = "ScreenOff\0";
> = 0;

#include "ReShade.fxh"
#define pixel float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT)

float3 PS_ScreenOff(float4 vpos : SV_Position, float2 texcoord : TexCoord) : SV_Target
{
        float3 output;
        output.r = 0;
        output.g = 0;
        output.b = 0;
        return output;
}

technique Defring
{
        pass
        {
                VertexShader = PostProcessVS;
                PixelShader = PS_ScreenOff;
        }
}