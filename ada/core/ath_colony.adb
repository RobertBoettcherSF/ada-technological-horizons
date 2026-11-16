with Ada.Numerics;
with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;
with Ath_Galaxy;
with Interfaces;

package body Ath_Colony is
   use type Interfaces.Integer_32;
   use type Interfaces.Unsigned_64;

   function Log (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Log (Value);
   end Log;

   function Exp (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Exp (Value);
   end Exp;

   function Sqrt (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Sqrt (Value);
   end Sqrt;

   function Cos (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Cos (Value);
   end Cos;

   function Sin (Value : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Sin (Value);
   end Sin;

   type Bits is mod 2 ** 64;
   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits := (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Unit (Index : Positive) return Long_Float is
      X : Interfaces.Unsigned_64 := Interfaces.Unsigned_64 (Index) * 16#9E37_79B9_7F4A_7C15#;
   begin
      X := X xor Interfaces.Shift_Right (X, 30);
      X := X * 16#BF58_476D_1CE4_E5B9#;
      X := X xor Interfaces.Shift_Right (X, 27);
      X := X * 16#94D0_49BB_1331_11EB#;
      X := X xor Interfaces.Shift_Right (X, 31);
      return Long_Float (X and 16#1F_FFFF_FFFF_FFFF#) / (2.0 ** 53);
   end Unit;

   function Left_After return Long_Float is
   begin
      return Billion - Short_Lived;
   end Left_After;

   function Self_Deaths return Long_Float is
   begin
      return Short_Lived * Self_In_100 / 100.0;
   end Self_Deaths;

   function Other_Deaths return Long_Float is
   begin
      return Short_Lived * Other_In_100 / 100.0;
   end Other_Deaths;

   function Escapers (Choice : Positive) return Long_Float is
   begin
      case Choice is
         when 1 => return 100_000.0;
         when 2 => return 1_000.0;
         when others => return 1.0;
      end case;
   end Escapers;

   procedure Survivors
     (Choice   : Positive;
      Years    : Long_Float;
      Alive    : out Long_Float;
      Distance : out Long_Float;
      Status   : out Status_Code) is
   begin
      Alive := 0.0;
      Distance := 0.0;
      if not Is_Finite (Years) then
         Status := Non_Finite;
         return;
      end if;
      if Years < 0.0 then
         Status := Not_Positive;
         return;
      end if;
      Alive := Ath_Galaxy.Coexisting (Escapers (Choice), Years);
      Distance := Ath_Galaxy.Neighbour_Of (Alive);
      Status := Ok;
   end Survivors;

   function Life_Of (Slider : Long_Float) return Long_Float is
      Phase : Long_Float := Slider;
   begin
      if not Is_Finite (Phase) then
         return Life_Min;
      end if;
      if Phase < 0.0 then
         Phase := 0.0;
      elsif Phase > 1.0 then
         Phase := 1.0;
      end if;
      return Life_Min * Exp (Phase * Log (Life_Max / Life_Min));
   end Life_Of;

   function Slider_Of (Years : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Years) or else Years <= Life_Min then
         return 0.0;
      end if;
      if Years >= Life_Max then
         return 1.0;
      end if;
      return Log (Years / Life_Min) / Log (Life_Max / Life_Min);
   end Slider_Of;

   function Shown_Survivors (Choice : Positive) return Natural is
   begin
      case Choice is
         when 1 => return 8;
         when 2 => return 3;
         when others => return 1;
      end case;
   end Shown_Survivors;

   function Rank (Index : Positive; Choice : Positive) return Natural is
      Mine  : constant Long_Float := Unit (40_000 + Choice * 100 + Index);
      Below : Natural := 0;
   begin
      for Other in 1 .. Cell_Count loop
         if Unit (40_000 + Choice * 100 + Other) < Mine
           or else (Unit (40_000 + Choice * 100 + Other) = Mine and then Other < Index)
         then
            Below := Below + 1;
         end if;
      end loop;
      return Below;
   end Rank;

   function Cell_Role (Index : Positive; Choice : Positive) return Interfaces.Integer_32 is
      Died : Natural;
   begin
      if Index > Cell_Count then
         return 0;
      end if;
      if Rank (Index, Choice) < Shown_Survivors (Choice) then
         return 2;
      end if;
      Died := Cell_Count - Shown_Survivors (Choice);
      if Rank (Index, Choice) - Shown_Survivors (Choice) < Natural (Long_Float (Died) * 0.65) then
         return 0;
      end if;
      return 1;
   end Cell_Role;

   procedure Fill
     (Hop_Ly, Hop_Years : Long_Float;
      Hops, Fill_Years  : out Long_Float;
      Status            : out Status_Code) is
   begin
      Hops := 0.0;
      Fill_Years := 0.0;
      if not Is_Finite (Hop_Ly) or else not Is_Finite (Hop_Years) then
         Status := Non_Finite;
         return;
      end if;
      if Hop_Ly <= 0.0 or else Hop_Years <= 0.0 then
         Status := Not_Positive;
         return;
      end if;
      Hops := Long_Float'Ceiling (Ath_Galaxy.Disc_Radius_Ly / Hop_Ly);
      if Hops < 1.0 then
         Hops := 1.0;
      end if;
      Fill_Years := Hops * Hop_Years;
      Status := Ok;
   end Fill;

   function Times_Over (Life_Years, Fill_Years : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Life_Years) or else not Is_Finite (Fill_Years) then
         return 0.0;
      end if;
      if Life_Years < 0.0 or else Fill_Years <= 0.0 then
         return 0.0;
      end if;
      return Life_Years / Fill_Years;
   end Times_Over;

   procedure Star
     (Index : Positive;
      X, Y  : out Long_Float) is
      Angle  : constant Long_Float := 2.0 * Ada.Numerics.Pi * Unit (50_000 + Index);
      Radial : constant Long_Float := Sqrt (Unit (60_000 + Index));
   begin
      X := Radial * Cos (Angle);
      Y := Radial * Sin (Angle);
   end Star;

   function Generation
     (Index, Origin : Positive;
      Hop_Ly        : Long_Float) return Interfaces.Integer_32 is
      X1, Y1, X2, Y2 : Long_Float;
      Span : Long_Float;
   begin
      if Hop_Ly <= 0.0 or else not Is_Finite (Hop_Ly) then
         return -1;
      end if;
      if Index = Origin then
         return 0;
      end if;
      Star (Index, X1, Y1);
      Star (Origin, X2, Y2);
      Span := Sqrt ((X1 - X2) ** 2 + (Y1 - Y2) ** 2) * Ath_Galaxy.Disc_Radius_Ly;
      if Span / Hop_Ly > 1.0e6 then
         return 1_000_000;
      end if;
      return Interfaces.Integer_32 (Long_Float'Ceiling (Span / Hop_Ly));
   end Generation;

   function Sample_Years (Index : Positive) return Long_Float is
   begin
      if Index > Sample_Count then
         return Life_Max;
      end if;
      return Life_Of (Long_Float (Index - 1) / Long_Float (Sample_Count - 1));
   end Sample_Years;
end Ath_Colony;
