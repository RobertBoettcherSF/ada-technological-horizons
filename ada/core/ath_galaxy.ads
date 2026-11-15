with Interfaces;

--  Coexisting civilisations and a declared disc spacing.
--
--  N = N_stars * f * min(L / T, 1). Lem's fraction is 1/150, so the
--  planetary-system count is 10^9. T is 15 billion years. L = 0 gives
--  N = 0. L >= T saturates at N_stars * f.
--
--  The nearest-neighbour distance is our picture of a flat disc of radius
--  50,000 light-years: half of one over the square root of the surface
--  density. It is not fitted to Lem's 10, 50 and 1,000 light-year figures.
package Ath_Galaxy is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Galaxy requires a binary64 Long_Float");

   Stars          : constant Long_Float := 1.5e11;
   Lem_Fraction   : constant Long_Float := 1.0 / 150.0;
   Modern_Fraction : constant Long_Float := 1.0;
   Window_Years   : constant Long_Float := 1.5e10;
   Disc_Radius_Ly : constant Long_Float := 50_000.0;
   Book_Years     : constant Long_Float := 6_523.0;
   Slider_Min     : constant Long_Float := 100.0;
   Slider_Max     : constant Long_Float := Window_Years;
   Ring_Ly        : constant Long_Float := 50.0;

   --  Model units. The page draws these with a scale of 82 and a star
   --  radius of 1.5, so this separation is a gap past two radii.
   Min_Separation : constant Long_Float := 0.048;

   Dot_Count    : constant := 144;
   Sample_Count : constant := 21;
   Pin_Count    : constant := 3;

   subtype Status_Code is Interfaces.Integer_32;
   Ok         : constant Status_Code := 0;
   Non_Finite : constant Status_Code := 1;
   Negative   : constant Status_Code := 2;

   Caption_None      : constant Interfaces.Integer_32 := 0;
   Caption_Some      : constant Interfaces.Integer_32 := 1;
   Caption_Saturated : constant Interfaces.Integer_32 := 2;

   type Sample_Values is array (1 .. Sample_Count) of Long_Float;
   type Pin_Values is array (1 .. Pin_Count) of Long_Float;
   type Pin_Flags is array (1 .. Pin_Count) of Interfaces.Integer_32;

   procedure Evaluate
     (Years         : Long_Float;
      Modern        : Boolean;
      Count         : out Long_Float;
      Distance      : out Long_Float;
      Distance_Known : out Boolean;
      Alive_Share   : out Long_Float;
      Saturated     : out Boolean;
      Caption       : out Interfaces.Integer_32;
      System_Count  : out Long_Float;
      Status        : out Status_Code);

   procedure Samples
     (Modern     : Boolean;
      Life       : out Sample_Values;
      Count      : out Sample_Values;
      Distance   : out Sample_Values;
      Life_Pos   : out Sample_Values;
      Distance_Pos : out Sample_Values);

   procedure Pins
     (Life     : out Pin_Values;
      Distance : out Pin_Values;
      Upper    : out Pin_Flags;
      Slider   : out Pin_Values);

   function Slider_Of (Years : Long_Float) return Long_Float;
   function Years_Of (Slider : Long_Float) return Long_Float;
   function Distance_Pos (Distance : Long_Float) return Long_Float;

   procedure Dot
     (Index : Positive;
      X     : out Long_Float;
      Y     : out Long_Float);

   --  Brightness follows the logarithmic slider, from 0 at 100 years to 1
   --  at the galaxy's age. It is the drawing, not the coexisting count.
   function Dot_Brightness (Index : Positive; Years : Long_Float) return Long_Float;

   function Dot_Lit (Index : Positive; Years : Long_Float) return Boolean;

   Distance_Axis_Min : constant Long_Float := 1.0;
   Distance_Axis_Max : constant Long_Float := 100_000.0;
end Ath_Galaxy;
