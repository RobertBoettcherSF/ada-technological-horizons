with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;
with Interfaces;

package body Ath_Galaxy is
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

   function Share_Of (Years : Long_Float) return Long_Float is
      Share : Long_Float;
   begin
      if Years <= 0.0 then
         return 0.0;
      end if;
      Share := Years / Window_Years;
      if Share > 1.0 then
         return 1.0;
      end if;
      return Share;
   end Share_Of;

   function Neighbour (Count : Long_Float) return Long_Float is
      Density : constant Long_Float :=
        Count / (Ada.Numerics.Pi * Disc_Radius_Ly * Disc_Radius_Ly);
   begin
      return 0.5 / Sqrt (Density);
   end Neighbour;

   function Log_Pos (Value, Low, High : Long_Float) return Long_Float is
   begin
      return Log (Value / Low) / Log (High / Low);
   end Log_Pos;

   procedure Evaluate
     (Years          : Long_Float;
      Modern         : Boolean;
      Count          : out Long_Float;
      Distance       : out Long_Float;
      Distance_Known : out Boolean;
      Alive_Share    : out Long_Float;
      Saturated      : out Boolean;
      Caption        : out Interfaces.Integer_32;
      System_Count   : out Long_Float;
      Status         : out Status_Code) is
   begin
      Count := 0.0;
      Distance := 0.0;
      Distance_Known := False;
      Alive_Share := 0.0;
      Saturated := False;
      Caption := Caption_None;
      System_Count := 0.0;
      if not Is_Finite (Years) then
         Status := Non_Finite;
         return;
      end if;
      if Years < 0.0 then
         Status := Negative;
         return;
      end if;
      if Modern then
         System_Count := Stars * Modern_Fraction;
      else
         System_Count := Stars / 150.0;
      end if;
      Alive_Share := Share_Of (Years);
      Count := System_Count * Alive_Share;
      Saturated := Years >= Window_Years;
      if Count > 0.0 then
         Distance := Neighbour (Count);
         Distance_Known := True;
         if Saturated then
            Caption := Caption_Saturated;
         else
            Caption := Caption_Some;
         end if;
      end if;
      Status := Ok;
   end Evaluate;

   procedure Samples
     (Modern       : Boolean;
      Life         : out Sample_Values;
      Count        : out Sample_Values;
      Distance     : out Sample_Values;
      Life_Pos     : out Sample_Values;
      Distance_Pos : out Sample_Values) is
      Phase : Long_Float;
      Known : Boolean;
      Share : Long_Float;
      Full  : Boolean;
      Caption : Interfaces.Integer_32;
      Systems : Long_Float;
      Status : Status_Code;
   begin
      for Index in 1 .. Sample_Count loop
         Phase := Long_Float (Index - 1) / Long_Float (Sample_Count - 1);
         Life (Index) := Years_Of (Phase);
         Evaluate
           (Life (Index), Modern, Count (Index), Distance (Index), Known,
            Share, Full, Caption, Systems, Status);
         Life_Pos (Index) := Log_Pos (Life (Index), Slider_Min, Slider_Max);
         Distance_Pos (Index) :=
           Log_Pos (Distance (Index), Distance_Axis_Min, Distance_Axis_Max);
      end loop;
   end Samples;

   procedure Pins
     (Life     : out Pin_Values;
      Distance : out Pin_Values;
      Upper    : out Pin_Flags;
      Slider   : out Pin_Values) is
   begin
      Life := (6_500.0, 1.0e8, 1.0e10);
      Distance := (1_000.0, 50.0, 10.0);
      Upper := (0, 0, 1);
      for Index in 1 .. Pin_Count loop
         Slider (Index) := Slider_Of (Life (Index));
      end loop;
   end Pins;

   function Coexisting (Population, Years : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Population) or else not Is_Finite (Years) then
         return 0.0;
      end if;
      if Population <= 0.0 or else Years < 0.0 then
         return 0.0;
      end if;
      return Population * Share_Of (Years);
   end Coexisting;

   function Neighbour_Of (Count : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Count) or else Count <= 0.0 then
         return 0.0;
      end if;
      return Neighbour (Count);
   end Neighbour_Of;

   function Slider_Of (Years : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Years) or else Years <= Slider_Min then
         return 0.0;
      end if;
      if Years >= Slider_Max then
         return 1.0;
      end if;
      return Log (Years / Slider_Min) / Log (Slider_Max / Slider_Min);
   end Slider_Of;

   function Distance_Pos (Distance : Long_Float) return Long_Float is
   begin
      if not Is_Finite (Distance) or else Distance <= Distance_Axis_Min then
         return 0.0;
      end if;
      if Distance >= Distance_Axis_Max then
         return 1.0;
      end if;
      return Log_Pos (Distance, Distance_Axis_Min, Distance_Axis_Max);
   end Distance_Pos;

   function Years_Of (Slider : Long_Float) return Long_Float is
      Phase : Long_Float := Slider;
   begin
      if not Is_Finite (Phase) then
         return Slider_Min;
      end if;
      if Phase < 0.0 then
         Phase := 0.0;
      elsif Phase > 1.0 then
         Phase := 1.0;
      end if;
      return Slider_Min * Exp (Phase * Log (Slider_Max / Slider_Min));
   end Years_Of;

   type Dot_Point is record
      X, Y : Long_Float;
   end record;

   Stored_Dots : array (1 .. Dot_Count) of Dot_Point := (others => (0.0, 0.0));

   procedure Place_Dots is
      Placed : Natural := 0;

      function Clear (X, Y : Long_Float) return Boolean is
         Dx, Dy : Long_Float;
      begin
         for Index in 1 .. Placed loop
            Dx := X - Stored_Dots (Index).X;
            Dy := Y - Stored_Dots (Index).Y;
            if Dx * Dx + Dy * Dy < Min_Separation * Min_Separation then
               return False;
            end if;
         end loop;
         return True;
      end Clear;
   begin
      for Seed in 1 .. 12_000 loop
         exit when Placed = Dot_Count;
         declare
            Arm : constant Natural := (Seed - 1) mod 3;
            Along : constant Long_Float := Unit (Seed);
            Theta : constant Long_Float :=
              2.0 * Ada.Numerics.Pi * (Long_Float (Arm) / 3.0 + Along * 2.15);
            Radial : constant Long_Float := 0.16 + 0.78 * Along;
            Side : constant Long_Float := (Unit (Seed + 9_000) - 0.5) * 0.035;
            X : constant Long_Float :=
              Radial * Cos (Theta) - Side * Sin (Theta);
            Y : constant Long_Float :=
              Radial * Sin (Theta) + Side * Cos (Theta);
         begin
            if X * X + Y * Y <= 1.02 and then Clear (X, Y) then
               Placed := Placed + 1;
               Stored_Dots (Placed) := (X, Y);
            end if;
         end;
      end loop;
   end Place_Dots;

   procedure Dot
     (Index : Positive;
      X     : out Long_Float;
      Y     : out Long_Float) is
   begin
      X := Stored_Dots (Index).X;
      Y := Stored_Dots (Index).Y;
   end Dot;

   function Dot_Brightness (Index : Positive; Years : Long_Float) return Long_Float is
      Share : constant Long_Float := Slider_Of (Years);
      Rank : constant Long_Float := Unit (Index + 900);
      Ahead : Long_Float;
   begin
      if not Is_Finite (Years) then
         return 0.0;
      end if;
      if Share >= 1.0 then
         return 1.0;
      end if;
      if Share <= 0.0 then
         return 0.0;
      end if;
      Ahead := (Share - Rank) * Long_Float (Dot_Count);
      if Ahead >= 1.0 then
         return 1.0;
      elsif Ahead <= 0.0 then
         return 0.0;
      else
         return Ahead;
      end if;
   end Dot_Brightness;

   function Dot_Lit (Index : Positive; Years : Long_Float) return Boolean is
   begin
      return Dot_Brightness (Index, Years) >= 0.5;
   end Dot_Lit;
begin
   Place_Dots;
end Ath_Galaxy;
