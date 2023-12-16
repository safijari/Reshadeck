uniform int Type <
        ui_type = "combo";
        ui_items = "Defring\0";
> = 0;

#include "ReShade.fxh"
#define pixel float2(BUFFER_RCP_WIDTH, BUFFER_RCP_HEIGHT)

float3 PS_Defring(float4 vpos : SV_Position, float2 texcoord : TexCoord) : SV_Target
{
        float3 input = tex2D(ReShade::BackBuffer, texcoord).rgb;

        // these values are eyeballed
        float green_amt = 0.2;
        float red_amt = 0.4;
        float blue_amt = 0.3;

        float3 right = tex2D(ReShade::BackBuffer, float2(texcoord.x + 1.0*pixel.x, texcoord.y)).rgb;
        float3 left = tex2D(ReShade::BackBuffer, float2(texcoord.x - 1.0*pixel.x, texcoord.y)).rgb;
        float3 bottom = tex2D(ReShade::BackBuffer, float2(texcoord.x, texcoord.y + 1.0*pixel.y)).rgb;

        float3 correction;
        correction.r = input.r*(1-red_amt) + left.r*red_amt;
        correction.g = input.g*(1-green_amt) + right.g*green_amt;
        correction.b = input.b*(1-blue_amt) + bottom.b*blue_amt;

        return correction;
}

technique Defring
{
        pass
        {
                VertexShader = PostProcessVS;
                PixelShader = PS_Defring;
        }
}
